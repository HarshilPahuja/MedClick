import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
export default function Navbar(){
return(
    <>
        <nav className='flex items-center flex-row border-b border-gray-300 bg-[#fbfdff]  gap-5 h-[14vh]'>
            <VolunteerActivismIcon/>
            <div className='flex flex-col'>
            <h1  className="text-3xl font-normal text-gray-700" style={{ fontFamily: 'Oswald, sans-serif' }}  >MediClick</h1>
            <h3>Your Medication Companion</h3>
            </div>
        </nav>
    </>
);

}
//issue1: inline google font works, but using tailwind it doesnt work.