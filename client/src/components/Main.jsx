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
    onError: (err) => {
      const msg = err.response?.data?.message || "Error adding medication.";
      setToast({ open: true, message: msg, severity: "error" });
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
    onError: (err) => {
      const msg = err.response?.data?.message || "Error updating medication.";
      setToast({ open: true, message: msg, severity: "error" });
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
    onError: (err) => {
      const msg = err.response?.data?.message || "Error deleting medication.";
      setToast({ open: true, message: msg, severity: "error" });
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
      const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const res = await axios.get(`https://medclick-5sc0.onrender.com/getmeds?day=${day}`, { withCredentials: true });
      
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      const nowPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      // Filter and transform meds based on local time
      return res.data.filter(med => {
        const [hh, mm] = med.med_time.split(":").map(Number);
        const t = new Date(now);
        t.setHours(hh, mm, 0, 0);

        const tPlus3 = new Date(t.getTime() + 3 * 60 * 60 * 1000);
        
        const isDue = now >= t && now <= tPlus3;
        const isUpcoming = now < t && t <= nowPlus2;

        if (isDue || isUpcoming) {
          const tMinus3 = new Date(t.getTime() - 3 * 60 * 60 * 1000);
          
          med.isTaken = med.logs?.some(log => {
            const loggedAt = new Date(`${log.logged_date}T${log.logged_time}`);
            return (loggedAt >= tMinus3 && loggedAt <= tPlus3) || (loggedAt >= sixHoursAgo);
          });
          return true;
        }
        return false;
      });
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header / Search Area */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <MedicationIcon sx={{ fontSize: 32 }} className="text-blue-600" />
              Patient Dashboard
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage your daily medication and health schedule.</p>
          </div>
          
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              sx={{
                minHeight: '40px',
                '& .MuiTabs-indicator': { 
                  height: '100%', 
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  zIndex: 0
                },
                '& .MuiTab-root': { 
                  color: '#64748b', 
                  transition: 'all 0.2s',
                  minHeight: '40px',
                  padding: '0 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  zIndex: 1,
                  textTransform: 'none',
                  fontSize: '0.875rem'
                },
                '& .Mui-selected': { color: '#0f172a !important' }
              }}
            >
              <Tab icon={<TodayIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Due Today" />
              <Tab icon={<InventoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="My Cabinet" />
            </Tabs>
          </div>
        </div>
        
        <form onSubmit={addmedicine} className="relative max-w-3xl">
          <input
            onChange={(e) => changeinput(e.target.value)}
            value={inputmed}
            className="w-full bg-white border border-slate-300 rounded-xl px-6 py-4 text-slate-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
            placeholder="Search or add a new medication..."
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg transition-all flex items-center gap-2 font-bold shadow-sm active:scale-95"
          >
            <AddIcon />
            <span className="hidden sm:inline">Add Medication</span>
          </button>
        </form>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabValue === 0 ? (
          loadingDue ? (
            <div className="col-span-full text-center py-24 text-slate-400 font-medium">Loading your schedule...</div>
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
            <div className="col-span-full text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicationIcon className="text-slate-300" sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No medications due</h3>
              <p className="text-slate-500 mt-1">You're all caught up for today. Great job!</p>
            </div>
          )
        ) : (
          loadingAll ? (
            <div className="col-span-full text-center py-24 text-slate-400 font-medium">Accessing medical records...</div>
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
            <div className="col-span-full text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <InventoryIcon className="text-slate-300" sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Cabinet is empty</h3>
              <p className="text-slate-500 mt-1">Add your first medication using the search bar above.</p>
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
          sx={{ width: '100%', borderRadius: '12px', fontWeight: '600' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}


