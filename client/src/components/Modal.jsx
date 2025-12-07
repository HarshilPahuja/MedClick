import { useState } from "react";


export default function Modal(props){
const days=['M','T','W','T','F','S','S'];
const [times_per_day_button_array, set_times_per_day_button_array]=useState([false,false,false,false]);
const [recurrence_array, set_recurrance_array]=useState([false,false,false]);
const [selected_days, set_selected_days]=useState(days.map(() => false));

function finalsubmit(){
    props.closemodalfromchild();
}

function handle_times_per_day_Recurrence(index) {
    const arr = [false, false, false,false];
    arr[index] = true;                 
    set_times_per_day_button_array(arr);            
}

function handle_reccurence_array(index){
    const arr=[false,false,false];
    arr[index]=true;
    set_recurrance_array(arr);
}

function toggle_selected_day(index){

    set_selected_days((prev)=>{
        return prev.map((item,i)=>{
           return i===index? !item:item
        })
    });
}



return( 
<>
    <div className="z-10 bg-[#90D5FF] h-[300px] w-[300px] ml-5 mt-5">
    <form onSubmit={finalsubmit}>


        <label htmlFor="medname">Medicine name</label>
        <input  className=" bg-gray-100 text-gray-500 cursor-not-allowed select-none" type="text" id="medname" value={props.medname}  readOnly/>

        <label htmlFor="dosage">Dosage </label>
        <input type="text" placeholder="eg, 1 tablet" id="dosage"/>

        <label htmlFor="instructions">Instruction </label>
        <input type="text" placeholder="eg, with water" id="instructions"/>

        <label>Times per day</label>
        <div className="flex gap-2">
           <button  type="button" className={`hover:border-2 ${times_per_day_button_array[0]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(0)}>1x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[1]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(1)}>2x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[2]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(2)}>3x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[3]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(3)}>custom</button>  
        </div>
        {times_per_day_button_array[0]? <div> <input type="time" id="time" name="time"/> </div>:null }
        {times_per_day_button_array[1]? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
        {times_per_day_button_array[2]? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
        {times_per_day_button_array[3]? <div> <h1>to be added</h1></div>:null }

        <label>Recurrence</label>
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <button className={`hover:border-2 ${recurrence_array[0]? "bg-red-300" : null}`} onClick={()=>{handle_reccurence_array(0)}} type="button">Daily </button>
                <button className={`hover:border-2 ${recurrence_array[1]? "bg-red-300" : null}`} onClick={()=>{handle_reccurence_array(1)}} type="button">Weekly </button>
                <button className={`hover:border-2 ${recurrence_array[2]? "bg-red-300" : null}`} onClick={()=>{handle_reccurence_array(2)}} type="button">Custom </button>
            </div>

            <div>

                {recurrence_array[1] ? 
                        <div className="flex gap-2">
                        {
                            days.map((label,index)=>{
                            return(
                            <button type="button" className={`hover:border-2 ${selected_days[index]? "bg-red-300" : null}`} key={index} onClick={()=>{toggle_selected_day(index)}}>{label}</button>
                                  );
                            })
                        
                        }
                        </div>  : null
                }


                {recurrence_array[2]?<div>coming soon</div>: null}

                


            </div>
        </div>


         
        <button type="submit"> save </button>

    </form>

    </div>

</>);


}
//{
// name:
// dosage:
// instruction:
// timers per day: //custom left.
// time: 
// recurrence:

// iscompleted:false
// }

// Mode	    Meaning  	                                    Example (Medicine Case)
// Daily	Every day	                                    “Take tablet every day at 9 AM”
// Weekly	Select specific days of the week	            “Take tablet only on Mon, Wed, Fri”- so reminder only on mon wed fri at particular time
// Custom	Flexible rule like every X days/weeks/months	“Take tablet every 2 days” or “Every 3 weeks”

//left-custom code, submissions, iscomplete and pass it as an object.