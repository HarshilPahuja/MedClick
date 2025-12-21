import Card from "./Card.jsx"
import Modal from "./Modal.jsx";
import {useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

//{
// name:
// dosage:
// instruction:
// timers per day:
// time:
// recurrence:
// }

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
        // alert(filledmed.final_dosage); //test1
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