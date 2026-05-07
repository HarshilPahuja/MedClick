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
      <div className="mb-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
        
        <h2 className="text-4xl font-black mb-8 flex items-center justify-center gap-3 tracking-tight">
          <MedicationIcon sx={{ fontSize: 40 }} className="text-blue-400 animate-pulse" />
          DASH<span className="text-blue-500">BOARD</span>
        </h2>
        
        <form onSubmit={addmedicine} className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <input
            onChange={(e) => changeinput(e.target.value)}
            value={inputmed}
            className="relative w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-blue-500/50 transition-all shadow-2xl placeholder:text-gray-500"
            placeholder="Search or add a new medicine..."
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 font-bold active:scale-95"
          >
            <AddIcon />
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>
      </div>

      {/* Tabs Section */}
      <div className="flex justify-center mb-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-1.5 border border-white/10 shadow-2xl">
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              minHeight: '48px',
              '& .MuiTabs-indicator': { 
                height: '100%', 
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              },
              '& .MuiTab-root': { 
                color: '#94a3b8', 
                transition: 'all 0.3s',
                minHeight: '48px',
                padding: '0 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                zIndex: 1,
                textTransform: 'none',
                fontSize: '0.95rem'
              },
              '& .Mui-selected': { color: '#60a5fa !important' }
            }}
          >
            <Tab icon={<TodayIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Due Today" />
            <Tab icon={<InventoryIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Cabinet" />
          </Tabs>
        </div>
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


