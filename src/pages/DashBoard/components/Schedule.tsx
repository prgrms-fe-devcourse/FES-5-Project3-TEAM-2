
import PlanContainer from './PlanContainer';
import TripInfo from './TripInfo';


function Schedule() {
  return (
    <section className="flex-1 px-[80px] py-[30px] flex flex-col gap-6 min-h-0">
      <TripInfo />
      <PlanContainer />
    </section>
  );
}
export default Schedule;
