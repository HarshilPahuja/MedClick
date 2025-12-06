import { useState } from "react";


export default function Modal(props){

const [ onexstate , set1xstate]=useState(false)
const [ twoxstate , set2xstate]=useState(false)
const [ threexstate , set3xstate]=useState(false)



function finalsubmit(){
    props.closemodalfromchild();
}

function click1x(){
    set1xstate(true);
    set2xstate(false);
    set3xstate(false);
}

function click2x(){
    set2xstate(true);
    set1xstate(false);
    set3xstate(false);
}

function click3x(){
    set3xstate(true);
    set1xstate(false);
    set2xstate(false);
}

return( 
<>
    <div className="z-10 bg-[#90D5FF] h-[300px] w-[300px] ml-5 mt-5">
    <form onSubmit={finalsubmit}>



        <input  className="  bg-gray-100 text-gray-500 cursor-not-allowed select-none" type="text" value={props.medname}  readOnly/>
        <input type="text" placeholder="Dosage" id="dosage"/>
        <input type="text" placeholder="Instructions" name="instructions"/>
        <div className="flex gap-2 reccurence">
            <button type="button" onClick={click1x} className="hover:border-2" >1x</button>
            <button type="button" onClick={click2x} className="hover:border-2" >2x</button>
            <button type="button" onClick={click3x} className="hover:border-2" >3x</button>
            <button type="button" className="hover:border-2">custom</button>  
        </div>

        {onexstate? <div> <input type="time" id="time" name="time"/> </div>:null }
        {twoxstate? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
        {threexstate? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
         
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