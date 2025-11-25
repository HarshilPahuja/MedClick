import Card from "./Card.jsx"
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

export default function Main(){

    function remove(dawaikanaam){

     pushmeds(meds.filter((name)=>{
        return name!=dawaikanaam;
     }));
    }

    function addmedicine(event){

        
    event.preventDefault();
    if(inputmed.trim()==""){//prevents empty to be pushed into the array
        alert("add some medicine, we know you need em amigo!");
        changeinput("");
    }
    else{
    pushmeds([...meds,inputmed]);
    changeinput("");   }
    }


    const [meds, pushmeds]=useState([]);
    const [inputmed, changeinput] =useState('');
    
    

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
           
            {meds.map((med,index)=>{
               return( <Card name={med} key={index} removemed={remove}/>); //each card has a key - index. find that index who clicked it. remove it 
            })}
        </>
    );
}