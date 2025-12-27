import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
export default function Card(props){
  
    return(
        <>
        <div className="flex gap-2">
            <h1>{props.name}</h1> 
            <button onClick={()=>{props.removemed(props.name);}}><CheckBoxOutlineBlankIcon/></button>
        </div>
        </>
    );
}