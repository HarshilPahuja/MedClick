import Card from "./Card.jsx"
import Modal from "./Modal.jsx";
import {useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

//{
// name:
// dosage:
// instruction:
// timers per day: //custom left.
// time: 
// recurrence:
// }

// const finalobject={
//     final_name:props.medname,
//     final_dosage:dosage,
//     final_instruction:instructions,
//     final_timesperday:times_per_day_button_array,
//     final_times:time,
//     final_days:selected_days,
//     }

export default function Main(){

    const [meds, pushmeds]=useState([]);   //array of objects
    const [inputmed, changeinput] =useState('');
    const [showmodal,togglemodal]=useState(false);
    const [currentmed,setcurrentmed]=useState("");

    function remove(dawaikanaam){
     pushmeds(meds.filter((name)=>{
        return name!=dawaikanaam;
     }));
    }


    function closemodal(filledmed){
//         alert(
//   `Name: ${filledmed.final_name}
// Dosage: ${filledmed.final_dosage}
// Instruction: ${filledmed.final_instruction}
// Times/Day: ${filledmed.final_timesperday}
// Times: ${filledmed.final_times}
// Day: ${filledmed.final_days}`
// ); //test
 

        togglemodal(false);
        pushmeds([...meds,inputmed]); //need to push the object. currentlyl pushing the wrong thing, then line 72 will need to fix
        changeinput("");

    }

    function addmedicine(event){
        event.preventDefault();

        if(inputmed.trim()==""){//prevents empty to be pushed into the array
            alert("add some medicine, we know you need em amigo!");
            changeinput("");
        }

        else{
        setcurrentmed(inputmed);
        togglemodal(true);
        }

    }
        



   

    return(
        <>
                <form onSubmit={addmedicine}>
                    <input 
                    onChange={(e)=>{
                        changeinput(e.target.value);
                    }} 
                    value={inputmed} 
                    name='medicine' 
                    placeholder='Add medicine name'/>
                    <button type='submit'><AddIcon/>Add Medication</button> 
                </form>

            {showmodal && <Modal closemodalfromchild={closemodal} medname={currentmed}/>}
           
            {meds.map((med,index)=>{
               return( <Card name={med} key={index} removemed={remove}/>);  
            })}
        </>
    );
}