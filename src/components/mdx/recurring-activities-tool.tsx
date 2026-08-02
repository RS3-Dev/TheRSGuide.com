import {
  RecurringActivitiesTracker,
  type RecurringActivity,
} from "@/components/mdx/recurring-activities-tracker";
import recurringActivities from "@/data/recurring-activities.json";

const activities = recurringActivities as RecurringActivity[];

export function RecurringActivitiesTool() {
  return <RecurringActivitiesTracker activities={activities} />;
}
