import EventModel from "../models/Event";
import AreaModel from "../models/Area";

function normalizeStatus(status: string) {
  return status?.toLowerCase()?.replace(/\s/g, "") || "";
}

// Expands 'areaIds: ["all"]' into actual area ID strings from the DB
export async function expandFilterWithAllAreas(filter: any): Promise<any> {
  if (filter.areaIds?.length === 1 && filter.areaIds[0].toLowerCase() === "all") {
    const allAreaIds = await AreaModel.find({}, { _id: 1 }).lean();
    filter.areaIds = allAreaIds.map((a) => a._id.toString());
    console.log("🗺️ Expanded areaIds to all areas:", filter.areaIds);
  }
  return filter;
}

function buildMatch(filter: any) {
  const { startDate, endDate, locationIds, areaIds, status } = filter;
  const match: any = {};

  if (startDate || endDate) {
    match.time_ = {};
    if (startDate) match.time_.$gte = new Date(startDate);
    if (endDate) match.time_.$lte = new Date(endDate);
  }

  if (locationIds?.length) {
    const validLocationIds = locationIds.filter((id: string) => !!id && id.toLowerCase() !== "all");
    if (validLocationIds.length > 0) {
      match.site_location = { $in: validLocationIds };
      console.log("📍 Filtering by locationIds:", validLocationIds);
    } else {
      console.log("🛑 Skipping location filter — locationIds empty or all");
    }
  }

  if (areaIds?.length) {
    const validAreaIds = areaIds.filter((id: string) => !!id && id.toLowerCase() !== "all");
    if (validAreaIds.length > 0) {
      match.area_location = { $in: validAreaIds };
      console.log("🗺️ Filtering by areaIds:", validAreaIds);
    } else {
      console.log("🛑 Skipping area filter — areaIds empty or all");
    }
  }

  if (status) match.status = status;

  console.log("🧩 Final $match object:", match);
  return match;
}

export async function getTotalEvents(filter: any): Promise<number> {
  const match = buildMatch(filter);
  return await EventModel.countDocuments(match);
}

export async function getTotalViolations(filter: any): Promise<number> {
  const match = buildMatch(filter);
  const result = await EventModel.aggregate([
    { $match: match },
    { $group: { _id: null, totalViolations: { $sum: "$no_hardhat_count" } } },
  ]);
  return result[0]?.totalViolations ?? 0;
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
  const match = buildMatch(filter);
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

  return Object.values(map);
}

export async function getEventsByLocationStatus(filter: any) {
  const match = buildMatch(filter);
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

  return Object.values(map);
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

  return Object.values(map);
}
