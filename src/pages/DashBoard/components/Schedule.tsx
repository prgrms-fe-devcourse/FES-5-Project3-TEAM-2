
import PlanList from './PlanList';
import TripInfo from './TripInfo';


function Schedule() {
  return (
    <section className="flex-1 px-[100px] py-[80px] flex flex-col gap-10">
      <TripInfo />
      <PlanList />
    </section>
  );
}
export default Schedule;
