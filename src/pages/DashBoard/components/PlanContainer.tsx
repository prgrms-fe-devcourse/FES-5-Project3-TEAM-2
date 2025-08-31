import TripDays from './TripDays'
import PlanList from './PlanList'

function PlanContainer() {

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <header>
        <h2 className="text-2 font-bold">일정 관리 📆</h2>
      </header>

      <div className='flex flex-col gap-4 flex-1 min-h-0'>
        <TripDays />
        <PlanList />
      </div>
    </section>
  )
}
export default PlanContainer