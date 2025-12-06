import Card from "./Card.jsx"
import Modal from "./Modal.jsx";
import {useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

export default function Main(){

    function remove(dawaikanaam){
     pushmeds(meds.filter((name)=>{
        return name!=dawaikanaam;
     }));
    }


    function closemodal(){

        togglemodal(false);
        pushmeds([...meds,inputmed]); //not pushing currently
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
        



    const [meds, pushmeds]=useState([]); //{
// name:
// dosage:
// instruction:
// timers per day:
// time:
// recurrence:
// iscompleted:false
// }


    const [inputmed, changeinput] =useState('');
    const [showmodal,togglemodal]=useState(false);
    const [currentmed,setcurrentmed]=useState("");

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