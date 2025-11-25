import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
export default function Card(props){

    function sendtoremove(){
        props.removemed(props.name);
    }
    
    return(
        <>
        <div className="flex gap-2">
            <h1>{props.name}</h1> 
            <button onClick={sendtoremove}><CheckBoxOutlineBlankIcon/></button>
        </div>
        </>
    );
}