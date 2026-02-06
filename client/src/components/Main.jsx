import Card from "./Card.jsx";
import Modal from "./Modal.jsx";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function Main() {
  const queryClient = useQueryClient();

  const addMedicineMutation = useMutation({
    mutationFn: (filledmed) =>
      axios.post(
        "https://medclick-5sc0.onrender.com/storemeds",
        { filledmed },
        { withCredentials: true }
      ),

    onSuccess: () => {
      // THIS forces refetch of /getmeds
      queryClient.invalidateQueries(["medicines"]);
    },
  });

  const [inputmed, changeinput] = useState("");
  const [showmodal, togglemodal] = useState(false);
  const [currentmed, setcurrentmed] = useState("");

  async function remove(dawaikanaam) {
    const res=await axios.post("https://medclick-5sc0.onrender.com/medtaken",{
      dawaikanaam
    },{withCredentials:true});

    if(res.data.success){
    queryClient.invalidateQueries(["medicines"]);
    }
  }

  async function closemodal(filledmed) {
    //         alert(
    //   `Name: ${filledmed.final_name}
    // Dosage: ${filledmed.final_dosage}
    // Instruction: ${filledmed.final_instruction}
    // Times/Day: ${filledmed.final_timesperday} //array->int
    // Times: ${filledmed.final_times}
    // Day: ${filledmed.final_days}` //array->varchar [T,T,F,F,F,F,F,F,F]
    // ); //test

    togglemodal(false);
    if (filledmed.final_timesperday[0]) {
      //1x
      filledmed.final_timesperday = 1;
    } else if (filledmed.final_timesperday[1]) {
      filledmed.final_timesperday = 2; //2x
    } else if (filledmed.final_timesperday[2]) {
      filledmed.final_timesperday = 3; //3x
    } else {
      filledmed.final_timesperday = 0; //custom
    }

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let indices = [];
    filledmed.final_days.forEach((value, idx) => {
      if (value) {
        indices.push(idx);
      }
    });
    let meddays = [];
    for (let i = 0; i < indices.length; i++) {
      meddays.push(days[indices[i]]);
    }
    filledmed.final_days = meddays;

    addMedicineMutation.mutate(filledmed); //calls the mutation function

    changeinput("");
  }

  function addmedicine(event) {
    event.preventDefault();

    if (inputmed.trim() == "") {
      //prevents empty to be pushed into the array
      alert("add some medicine, we know you need em amigo!");
      changeinput("");
    } else {
      setcurrentmed(inputmed);
      togglemodal(true);
    }
  }

  const { isPending, error, data } = useQuery({
    //tanstack manages a stateful array itself.-data
    queryKey: ["medicines"],
    queryFn: async () => {
      const res = await axios.get("https://medclick-5sc0.onrender.com/getmeds", {
        withCredentials: true,
      });
      return res.data; //whatever u return from query function becomes data;
    },
  });

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <>
      <form onSubmit={addmedicine}>
        <input
          onChange={(e) => {
            changeinput(e.target.value);
          }}
          value={inputmed}
          name="medicine"
          placeholder="Add medicine name"
        />
        <button type="submit">
          <AddIcon />
          Add Medication
        </button>
      </form>

      {showmodal && (
        <Modal closemodalfromchild={closemodal} medname={currentmed} />
      )}

      {data.map((med, index) => {
        return <Card name={med.med_name} key={index} removemed={remove} />;
      })}
    </>
  );
}
