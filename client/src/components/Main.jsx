import Card from "./Card.jsx";
import Modal from "./Modal.jsx";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Snackbar, Alert, Tabs, Tab, Box } from "@mui/material";
import MedicationIcon from '@mui/icons-material/Medication';
import TodayIcon from '@mui/icons-material/Today';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Main() {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [editMedData, setEditMedData] = useState(null);

  const addMedicineMutation = useMutation({
    mutationFn: (filledmed) =>
      axios.post(
        "https://medclick-5sc0.onrender.com/storemeds",
        { filledmed },
        { withCredentials: true }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["due-medicines"]);
      queryClient.invalidateQueries(["all-medicines"]);
      setToast({ open: true, message: "Medication added successfully!", severity: "success" });
    },
  });

  const updateMedicineMutation = useMutation({
    mutationFn: (filledmed) =>
      axios.post(
        "https://medclick-5sc0.onrender.com/updatemed",
        { filledmed },
        { withCredentials: true }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["due-medicines"]);
      queryClient.invalidateQueries(["all-medicines"]);
      setToast({ open: true, message: "Medication updated!", severity: "success" });
    },
  });

  const deleteMedicineMutation = useMutation({
    mutationFn: (name) =>
      axios.delete(`https://medclick-5sc0.onrender.com/deletemed/${name}`, {
        withCredentials: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["due-medicines"]);
      queryClient.invalidateQueries(["all-medicines"]);
      setToast({ open: true, message: "Medication deleted.", severity: "info" });
    },
  });

  const [inputmed, changeinput] = useState("");
  const [showmodal, togglemodal] = useState(false);
  const [currentmed, setcurrentmed] = useState("");

  async function handleTakeMedicine(dawaikanaam) {
    try {
      const res = await axios.post("https://medclick-5sc0.onrender.com/medtaken", {
        dawaikanaam
      }, { withCredentials: true });

      if (res.data.success) {
        queryClient.invalidateQueries(["due-medicines"]);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error taking medicine.";
      setToast({ open: true, message: msg, severity: "warning" });
      return false;
    }
  }

  async function closemodal(filledmed) {
    togglemodal(false);
    setEditMedData(null);
    
    if (!filledmed) return;

    // Process form data
    if (filledmed.final_timesperday[0]) filledmed.final_timesperday = 1;
    else if (filledmed.final_timesperday[1]) filledmed.final_timesperday = 2;
    else if (filledmed.final_timesperday[2]) filledmed.final_timesperday = 3;
    else filledmed.final_timesperday = 0;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let meddays = [];
    filledmed.final_days.forEach((value, idx) => {
      if (value) meddays.push(days[idx]);
    });
    filledmed.final_days = meddays;

    if (filledmed.isUpdate) {
      updateMedicineMutation.mutate(filledmed);
    } else {
      addMedicineMutation.mutate(filledmed);
    }
    changeinput("");
  }

  function handleEdit(med) {
    setcurrentmed(med.med_name);
    setEditMedData(med);
    togglemodal(true);
  }

  function addmedicine(event) {
    event.preventDefault();
    if (inputmed.trim() === "") {
      setToast({ open: true, message: "Please enter a medicine name.", severity: "error" });
    } else {
      setcurrentmed(inputmed);
      setEditMedData(null);
      togglemodal(true);
    }
  }

  const { isPending: loadingDue, data: dueMeds = [] } = useQuery({
    queryKey: ["due-medicines"],
    queryFn: async () => {
      const res = await axios.get("https://medclick-5sc0.onrender.com/getmeds", { withCredentials: true });
      return res.data;
    },
  });

  const { isPending: loadingAll, data: allMeds = [] } = useQuery({
    queryKey: ["all-medicines"],
    queryFn: async () => {
      const res = await axios.get("https://medclick-5sc0.onrender.com/allmeds", { withCredentials: true });
      return res.data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Header / Search Area */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
          <MedicationIcon fontSize="large" className="text-blue-500" />
          Dashboard
        </h2>
        
        <form onSubmit={addmedicine} className="relative max-w-2xl mx-auto">
          <input
            onChange={(e) => changeinput(e.target.value)}
            value={inputmed}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xl"
            placeholder="Search or add a new medicine..."
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <AddIcon />
            <span className="hidden sm:inline">Add Medication</span>
          </button>
        </form>
      </div>

      {/* Tabs Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 mb-8 border border-white/10 shadow-2xl inline-block mx-auto flex justify-center max-w-md">
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)}
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '3px', borderRadius: '3px' },
            '& .MuiTab-root': { color: '#94a3b8', transition: 'all 0.3s' },
            '& .Mui-selected': { color: '#3b82f6 !important' }
          }}
        >
          <Tab icon={<TodayIcon />} iconPosition="start" label="Due Today" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="My Cabinet" />
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabValue === 0 ? (
          loadingDue ? (
            <div className="col-span-full text-center py-20 text-gray-400">Loading your schedule...</div>
          ) : dueMeds.length > 0 ? (
            dueMeds.map((med, index) => (
              <Card 
                key={index}
                med={med}
                type="due"
                onAction={handleTakeMedicine}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-400">No medicines due right now. Relax! 🌿</p>
            </div>
          )
        ) : (
          loadingAll ? (
            <div className="col-span-full text-center py-20 text-gray-400">Opening your cabinet...</div>
          ) : allMeds.length > 0 ? (
            allMeds.map((med, index) => (
              <Card 
                key={index}
                med={med}
                type="cabinet"
                onAction={() => deleteMedicineMutation.mutate(med.med_name)}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-400">Your cabinet is empty. Add some medicines above!</p>
            </div>
          )
        )}
      </div>

      {showmodal && (
        <Modal 
          closemodalfromchild={closemodal} 
          medname={currentmed} 
          initialData={editMedData}
        />
      )}

      {/* Toast Notifications */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}


