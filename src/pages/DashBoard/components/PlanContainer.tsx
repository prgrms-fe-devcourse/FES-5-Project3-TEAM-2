import TripDays from './TripDays'
import PlanList from './PlanList'

function PlanContainer() {

  return (
    <section className="">
      <header>
        <h2 className="text-3 font-bold">일정 관리 📆</h2>
      </header>

      <div className='flex flex-col gap-6'>
        <TripDays />
        <PlanList />
      </div>
    </section>
  )
}
export default PlanContainer