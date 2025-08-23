import EventModel from "../models/Event";
import AreaModel from "../models/Area";
import UserModel from "../models/User";

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

export const getViolationTimestamps = async (filters: any): Promise<string[]> => {
  const query: any = {
    no_hardhat_count: { $gt: 0 },
  };
  if (filters.locationIds?.length) {
    query.site_location = { $in: filters.locationIds };
  }

  if (filters.areaIds?.length) {
    query.area_location = { $in: filters.areaIds };
  }

  if (filters.startDate || filters.endDate) {
    query.time_ = {};
    if (filters.startDate) {
      query.time_.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.time_.$lte = new Date(filters.endDate);
    }
  }
  const events = await EventModel.find(query).select("time_ -_id").lean();
  return events.map((event) => new Date(event.time_).toISOString());
};


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



export async function getUserAnalytics(filter: any) {
  console.log('🔍 getUserAnalytics called with filter:', filter);
  
  const { startDate, endDate, locationIds } = filter;
  const match: any = {};

  // Only apply filters if they are actually provided
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  if (locationIds && locationIds.length > 0) {
    match.site_location = { $in: locationIds };
  }

  console.log('🔍 Match criteria:', match);

  // Get all users with the applied filters
  const allUsers = await UserModel.find(match).lean();
  console.log('🔍 Users found with filters:', allUsers.length);
  
  const userCounts = {
    admin: 0,
    viewer: 0,
    supervisor: 0,
    total: 0
  };
  
  allUsers.forEach(user => {
    const accessLevel = user.access_level || 'viewer';
    console.log('🔍 User:', user.name, 'access_level:', accessLevel);
    if (userCounts.hasOwnProperty(accessLevel)) {
      userCounts[accessLevel as keyof typeof userCounts]++;
    } else {
      userCounts.viewer++;
    }
    userCounts.total++;
  });
  
  console.log('🔍 Final userCounts:', userCounts);
  return userCounts;
}

export async function getUserGrowthOverTime(filter: any) {
  const { startDate, endDate, locationIds } = filter;
  const match: any = {};

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  if (locationIds?.length) {
    match.site_location = { $in: locationIds };
  }

  // First, let's get all users with their creation dates
  const allUsers = await UserModel.find(match).select('createdAt access_level').lean();
  
  if (allUsers.length === 0) {
    return [];
  }

  // Group users by date and access level
  const userGroups: Record<string, any> = {};
  
  allUsers.forEach(user => {
    const date = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const accessLevel = user.access_level || 'viewer';
    
    if (!userGroups[date]) {
      userGroups[date] = { date, admin: 0, viewer: 0, supervisor: 0, total: 0 };
    }
    
    userGroups[date][accessLevel]++;
    userGroups[date].total++;
  });

  // Convert to array and sort by date
  const result = Object.values(userGroups).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return result;
}

export async function getSeverityDistribution(filter: any) {
  try {
    const match = buildMatch(filter);
    
    // Get violations grouped by no_hardhat_count
    const severityViolations = await EventModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$no_hardhat_count",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total violations for percentage calculation
    const totalViolations = await EventModel.countDocuments(match);

    // Define severity categories
    const severityCategories = [
      { min: 1, max: 1, label: "1 Person" },
      { min: 2, max: 2, label: "2 People" },
      { min: 3, max: 3, label: "3 People" },
      { min: 4, max: Infinity, label: "4+ People" }
    ];

    // Group violations by severity categories
    const severityDistribution = severityCategories.map(category => {
      const count = severityViolations
        .filter(v => {
          const hardhatCount = Number(v._id);
          return hardhatCount >= category.min && hardhatCount <= category.max;
        })
        .reduce((sum, v) => sum + v.count, 0);
      
      return {
        severity: category.label,
        count: count,
        percentage: totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0
      };
    });

    return severityDistribution;
  } catch (error) {
    console.error('Error in getSeverityDistribution:', error);
    // Return default structure on error
    return [
      { severity: "1 Person", count: 0, percentage: 0 },
      { severity: "2 People", count: 0, percentage: 0 },
      { severity: "3 People", count: 0, percentage: 0 },
      { severity: "4+ People", count: 0, percentage: 0 }
    ];
  }
}

export async function getViolationProbability(filter: any) {
  const match = buildMatch(filter);
  
  // Get violations by hour of day
  const hourlyViolations = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $hour: "$time_" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get violations by day of week
  const dailyViolations = await EventModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dayOfWeek: "$time_" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Calculate total violations for percentage calculation
  const totalViolations = await EventModel.countDocuments(match);

  // Process hourly data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = hourlyViolations.find(h => h._id === hour);
    return {
      hour: hour,
      count: hourData?.count || 0,
      percentage: totalViolations > 0 ? Math.round((hourData?.count || 0) / totalViolations * 100) : 0
    };
  });

  // Process daily data
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyData = Array.from({ length: 7 }, (_, dayIndex) => {
    const dayData = dailyViolations.find(d => d._id === dayIndex + 1); // MongoDB dayOfWeek is 1-7
    return {
      day: dayNames[dayIndex],
      count: dayData?.count || 0,
      percentage: totalViolations > 0 ? Math.round((dayData?.count || 0) / totalViolations * 100) : 0
    };
  });

  // Find peak hours and days
  const peakHour = hourlyData.reduce((max, current) => 
    current.count > max.count ? current : max
  );
  
  const peakDay = dailyData.reduce((max, current) => 
    current.count > max.count ? current : max
  );

  return {
    hourlyData,
    dailyData,
    peakHour,
    peakDay,
    totalViolations
  };
<<<<<<< HEAD
}
=======
}
>>>>>>> f60cc7d (stablize system)
