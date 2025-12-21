import { useState } from "react";
//{
// name:
// dosage:
// instruction:
// timers per day: //custom left.
// time: 
// recurrence:
// }

export default function Modal(props){


const days=['M','T','W','T','F','S','S'];
const [times_per_day_button_array, set_times_per_day_button_array]=useState([false,false,false,false]);//1x 2x 3x custom
const [recurrence_array, set_recurrance_array]=useState([false,false,false]); //daily weekly custom
const [selected_days, set_selected_days]=useState(days.map(() => false));

const [dosage, set_dosage]=useState("");
const [instructions, set_instructions]=useState("");
const [time, set_time]=useState([]);//hh:mm format 



function finalsubmit(e){
    e.preventDefault();
    const finalobject={
    final_name:props.medname,
    final_dosage:dosage,
    final_instruction:instructions,
    final_timesperday:times_per_day_button_array,
    final_times:time,
    final_days:selected_days,
    }
    props.closemodalfromchild(finalobject);
    
}

function handle_times_per_day_Recurrence(index) {
    let count;
    if(index==3){
        count=0; //for coming soon
    }
    else{
        count=index+1;
    }
    
    set_time(Array(count).fill(""));
    const arr = [false, false, false,false];
    arr[index] = true;                 
    set_times_per_day_button_array(arr);            
}

function handle_reccurence_array(index){

    if(index==0){
    set_selected_days(days.map(()=> true));
    }
    else{
        set_selected_days(days.map(()=> false))
    }
   
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

function setting_time(ind,e){
   
    set_time((prev)=>{

    return prev.map((t,i)=>i==ind?e.target.value:t)
    })
   
}



return( 
<>
    <div className="z-10 bg-[#90D5FF] h-[300px] w-[300px] ml-5 mt-5">
    <form onSubmit={finalsubmit}>


        <label htmlFor="medname">Medicine name</label>
        <input  className=" bg-gray-100 text-gray-500 cursor-not-allowed select-none" type="text" id="medname" value={props.medname}  readOnly/>

        <label htmlFor="dosage">Dosage </label>
        <input type="text" placeholder="eg, 1 tablet" value={dosage} onChange={(e)=>{
            set_dosage(e.target.value);
        }}/>

        <label htmlFor="instructions">Instruction </label>
        <input type="text" placeholder="eg, with water" value={instructions} onChange={(e)=>{
            set_instructions(e.target.value);
        }}/>

        <label>Times per day</label>
        <div className="flex gap-2">
           <button  type="button" className={`hover:border-2 ${times_per_day_button_array[0]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(0)}>1x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[1]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(1)}>2x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[2]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(2)}>3x</button>
            <button type="button" className={`hover:border-2 ${times_per_day_button_array[3]? "bg-red-300" : null}`} onClick={() => handle_times_per_day_Recurrence(3)}>custom</button>  
        </div>
        {
            time.map((t, index)=>{
               return <input onChange={(event)=>{
                 setting_time(index,event)
                }}key={index} value={t} type="time"/>
            })
        }
        {times_per_day_button_array[3]? <div> <h1>coming soon</h1></div>:null }

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


// Mode	    Meaning  	                                    Example (Medicine Case)
// Daily	Every day	                                    “Take tablet every day at 9 AM”
// Weekly	Select specific days of the week	            “Take tablet only on Mon, Wed, Fri”- so reminder only on mon wed fri at particular time
// Custom	Flexible rule like every X days/weeks/months	“Take tablet every 2 days” or “Every 3 weeks”

//left-custom code