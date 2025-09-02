
import PlanContainer from './PlanContainer';
import TripInfo from './TripInfo';


function Schedule() {
  return (
    <section className="w-[50%] px-[50px] py-[40px] flex flex-col gap-8 min-h-0 box-border">
      <TripInfo />
      <PlanContainer />
    </section>
  );
}
export default Schedule;