import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { percent } from "@/lib/format";

type AuthUser = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  units: string | null;
  is_onboarded: boolean | null;
  created_at: string;
  updated_at: string;
};

type TrainingPlanRow = {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string | null;
  race_date: string | null;
  start_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type WorkoutRow = {
  id: string;
  training_plan_id: string;
  user_id: string;
  title: string | null;
  type: string | null;
  date: string | null;
  is_completed: boolean | null;
  is_skipped: boolean | null;
  planned_distance: number | null;
  actual_distance: number | null;
  completed_at: string | null;
  updated_at: string;
};

type EventRow = {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  event_name: string;
  platform: string | null;
  app_surface: string | null;
  created_at: string;
  properties: Record<string, unknown> | null;
};

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  joinedAt: string;
  lastSeenAt: string | null;
  activePlanName: string | null;
  raceDate: string | null;
  completedWorkouts: number;
  totalWorkouts: number;
  completionRate: number;
};

export type AdminOverview = {
  stats: {
    totalUsers: number;
    newUsers7d: number;
    activePlans: number;
    totalPlans: number;
    completedWorkouts: number;
    workouts7d: number;
    planGenerations7d: number;
    syncFailures7d: number;
  };
  users: AdminUserRow[];
  eventCounts: { eventName: string; count: number }[];
  recentEvents: EventRow[];
};

export type AdminUserDetail = {
  user: AdminUserRow;
  profile: ProfileRow | null;
  authUser: AuthUser | null;
  plans: TrainingPlanRow[];
  workouts: WorkoutRow[];
  events: EventRow[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function isAfter(value: string | null | undefined, cutoff: number): boolean {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= cutoff;
}

async function listAuthUsers(): Promise<AuthUser[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const users: AuthUser[] = [];
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;
    const batch = (data?.users ?? []) as AuthUser[];
    users.push(...batch);

    if (batch.length < perPage) break;
    page += 1;
  }

  return users;
}

async function readTable<T>(
  table: string,
  select = "*",
  limit?: number,
): Promise<T[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin.from(table).select(select);
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}

async function readRecentEvents(limit = 500): Promise<EventRow[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("app_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as EventRow[];
  } catch {
    return [];
  }
}

function buildUsers({
  authUsers,
  profiles,
  plans,
  workouts,
}: {
  authUsers: AuthUser[];
  profiles: ProfileRow[];
  plans: TrainingPlanRow[];
  workouts: WorkoutRow[];
}): AdminUserRow[] {
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const workoutsByUser = new Map<string, WorkoutRow[]>();
  const plansByUser = new Map<string, TrainingPlanRow[]>();

  for (const workout of workouts) {
    const rows = workoutsByUser.get(workout.user_id) ?? [];
    rows.push(workout);
    workoutsByUser.set(workout.user_id, rows);
  }

  for (const plan of plans) {
    const rows = plansByUser.get(plan.user_id) ?? [];
    rows.push(plan);
    plansByUser.set(plan.user_id, rows);
  }

  return authUsers
    .map((authUser) => {
      const profile = profileMap.get(authUser.id);
      const userPlans = plansByUser.get(authUser.id) ?? [];
      const activePlan =
        userPlans.find((plan) => plan.status === "active") ?? userPlans[0] ?? null;
      const userWorkouts = workoutsByUser.get(authUser.id) ?? [];
      const completed = userWorkouts.filter((workout) => workout.is_completed).length;
      const lastWorkoutUpdate = userWorkouts
        .map((workout) => workout.completed_at ?? workout.updated_at)
        .filter(Boolean)
        .sort()
        .at(-1);
      const lastSeenAt =
        lastWorkoutUpdate ?? authUser.last_sign_in_at ?? profile?.updated_at ?? null;

      return {
        id: authUser.id,
        email: authUser.email ?? profile?.email ?? authUser.id.slice(0, 8),
        role: profile?.role ?? "user",
        joinedAt: authUser.created_at ?? profile?.created_at ?? "",
        lastSeenAt,
        activePlanName: activePlan?.plan_name ?? null,
        raceDate: activePlan?.race_date ?? null,
        completedWorkouts: completed,
        totalWorkouts: userWorkouts.length,
        completionRate: percent(completed, userWorkouts.length),
      };
    })
    .sort((a, b) => (b.lastSeenAt ?? b.joinedAt).localeCompare(a.lastSeenAt ?? a.joinedAt));
}

function countEvents(events: EventRow[]): { eventName: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.event_name, (counts.get(event.event_name) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [authUsers, profiles, plans, workouts, recentEvents] = await Promise.all([
    listAuthUsers(),
    readTable<ProfileRow>("profiles"),
    readTable<TrainingPlanRow>("training_plans"),
    readTable<WorkoutRow>("workouts"),
    readRecentEvents(),
  ]);

  const cutoff7d = Date.now() - 7 * DAY_MS;
  const users = buildUsers({ authUsers, profiles, plans, workouts });
  const events7d = recentEvents.filter((event) => isAfter(event.created_at, cutoff7d));

  return {
    stats: {
      totalUsers: authUsers.length,
      newUsers7d: authUsers.filter((user) => isAfter(user.created_at, cutoff7d)).length,
      activePlans: plans.filter((plan) => plan.status === "active").length,
      totalPlans: plans.length,
      completedWorkouts: workouts.filter((workout) => workout.is_completed).length,
      workouts7d: workouts.filter((workout) => isAfter(workout.completed_at, cutoff7d)).length,
      planGenerations7d: events7d.filter((event) => event.event_name === "plan_generated").length,
      syncFailures7d: events7d.filter((event) => event.event_name === "sync_failed").length,
    },
    users,
    eventCounts: countEvents(events7d),
    recentEvents: recentEvents.slice(0, 20),
  };
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const [authUsers, profiles, plans, workouts] = await Promise.all([
    listAuthUsers(),
    readTable<ProfileRow>("profiles"),
    readTable<TrainingPlanRow>("training_plans"),
    readTable<WorkoutRow>("workouts"),
  ]);

  return buildUsers({ authUsers, profiles, plans, workouts });
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const [users, authUsers, profiles, plans, workouts, events] = await Promise.all([
    getAdminUsers(),
    listAuthUsers(),
    readTable<ProfileRow>("profiles"),
    readTable<TrainingPlanRow>("training_plans"),
    readTable<WorkoutRow>("workouts"),
    readRecentEvents(1000),
  ]);

  const user = users.find((row) => row.id === userId);
  if (!user) return null;

  return {
    user,
    authUser: authUsers.find((row) => row.id === userId) ?? null,
    profile: profiles.find((row) => row.id === userId) ?? null,
    plans: plans.filter((row) => row.user_id === userId),
    workouts: workouts.filter((row) => row.user_id === userId),
    events: events.filter((row) => row.user_id === userId).slice(0, 50),
  };
}
