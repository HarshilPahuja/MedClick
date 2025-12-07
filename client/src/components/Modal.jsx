import { useState } from "react";


export default function Modal(props){

const [buttonarray, setbuttonarray]=useState([false,false,false]);


function finalsubmit(){
    props.closemodalfromchild();
}

function handleRecurrence(index) {
    const arr = [false, false, false];
    arr[index] = true;                 
    setbuttonarray(arr);            
}

return( 
<>
    <div className="z-10 bg-[#90D5FF] h-[300px] w-[300px] ml-5 mt-5">
    <form onSubmit={finalsubmit}>



        <input  className="  bg-gray-100 text-gray-500 cursor-not-allowed select-none" type="text" value={props.medname}  readOnly/>
        <input type="text" placeholder="Dosage" id="dosage"/>
        <input type="text" placeholder="Instructions" name="instructions"/>
        <div className="flex gap-2 reccurence">
           <button type="button"  className="hover:border-2" onClick={() => handleRecurrence(0)}>1x</button>
            <button type="button" className="hover:border-2" onClick={() => handleRecurrence(1)}>2x</button>
            <button type="button" className="hover:border-2" onClick={() => handleRecurrence(2)}>3x</button>
            <button type="button" className="hover:border-2">custom</button>  
        </div>

        {buttonarray[0]? <div> <input type="time" id="time" name="time"/> </div>:null }
        {buttonarray[1]? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
        {buttonarray[2]? <div> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> <input type="time" id="time" name="time"/> </div>:null }
         
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