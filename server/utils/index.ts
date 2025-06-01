import EventModel from "../models/Event";
import mongoose from "mongoose";

function normalizeStatus(status: string) {
  return status?.toLowerCase()?.replace(/\s/g, "") || "";
}

function ensureObjectId(val: any) {
  if (val && typeof val === "object" && val._bsontype === "ObjectID")
    return val;
  if (mongoose.isValidObjectId(val)) return new mongoose.Types.ObjectId(val);
  return val;
}

function buildMatch(filter: any, options: { ignoreArea?: boolean } = {}) {
  const { startDate, endDate, locationIds, areaIds, status } = filter;
  const match: any = {};

  if (startDate || endDate) {
    match.time_ = {};
    if (startDate) match.time_.$gte = new Date(startDate);
    if (endDate) match.time_.$lte = new Date(endDate);
  }

  if (locationIds?.length) {
    const validLocationIds = locationIds
      .filter((id: string) => id !== "all")
      .map(ensureObjectId);
    if (validLocationIds.length > 0)
      match.site_location = { $in: validLocationIds };
  }

  if (!options.ignoreArea && areaIds?.length) {
    const validAreaIds = areaIds
      .filter((id: string) => id !== "all")
      .map(ensureObjectId);
    if (validAreaIds.length > 0) match.area_location = { $in: validAreaIds };
  }

  if (status) match.status = status;

  return match;
}

export async function getTotalEvents(filter: any): Promise<number> {
  const match = buildMatch(filter);
  const count = await EventModel.countDocuments(match);
  return count;
}

export async function getTotalViolations(filter: any): Promise<number> {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    { $group: { _id: null, totalViolations: { $sum: "$no_hardhat_count" } } },
  ]);
  const total = result[0]?.totalViolations ?? 0;
  return total;
}

export async function getEventsByDate(filter: any) {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$time_" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return result.map((r) => ({ date: r._id, count: r.count }));
}

export async function getStatusCounts(filter: any) {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const mapped: Record<string, number> = {};
  result.forEach((r) => {
    const key = normalizeStatus(r._id);
    if (key === "handled") mapped["Handled"] = r.count;
    else mapped["Not Handled"] = r.count;
  });

  return mapped;
}

export async function getEventsByLocation(filter: any) {
  const match = buildMatch(filter, { ignoreArea: true });
  const result = await EventModel.aggregate([
    { $match: match },
    { $group: { _id: "$site_location", count: { $sum: 1 } } },
  ]);
  return result.map((r) => ({ locationId: r._id, count: r.count }));
}

export async function getEventsByArea(filter: any) {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    { $group: { _id: "$area_location", count: { $sum: 1 } } },
  ]);
  return result.map((r) => ({ areaId: r._id, count: r.count }));
}

export async function getEventsByDateStatus(filter: any) {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$time_" } },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const map: Record<string, any> = {};
  result.forEach(({ _id, count }) => {
    const { date, status } = _id;
    const normStatus = normalizeStatus(status);
    if (!map[date]) map[date] = { date, handled: 0, unhandled: 0, total: 0 };
    if (normStatus === "handled") map[date].handled += count;
    else map[date].unhandled += count;
    map[date].total += count;
  });

  const final = Object.values(map);
  return final;
}

export async function getEventsByLocationStatus(filter: any) {
  const match = buildMatch(filter, { ignoreArea: true }); // ✅ FIXED
  const result = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { location: "$site_location", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const map: Record<string, any> = {};
  result.forEach(({ _id, count }) => {
    const { location, status } = _id;
    const normStatus = normalizeStatus(status);
    if (!map[location])
      map[location] = { locationId: location, handled: 0, unhandled: 0 };
    if (normStatus === "handled") map[location].handled += count;
    else map[location].unhandled += count;
  });

  const final = Object.values(map);
  return final;
}

export async function getEventsByAreaStatus(filter: any) {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { area: "$area_location", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const map: Record<string, any> = {};
  result.forEach(({ _id, count }) => {
    const { area, status } = _id;
    const normStatus = normalizeStatus(status);
    if (!map[area]) map[area] = { areaId: area, handled: 0, unhandled: 0 };
    if (normStatus === "handled") map[area].handled += count;
    else map[area].unhandled += count;
  });

  const final = Object.values(map);
  return final;
}
