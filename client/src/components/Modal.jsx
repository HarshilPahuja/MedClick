import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

export default function Modal({ closemodalfromchild, medname, initialData = null }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const [times_per_day_button_array, set_times_per_day_button_array] = useState([true, false, false, false]);
  const [recurrence_array, set_recurrance_array] = useState([true, false, false]);
  const [selected_days, set_selected_days] = useState(fullDays.map(() => true));

  const [dosage, set_dosage] = useState("");
  const [instructions, set_instructions] = useState("");
  const [time, set_time] = useState(["09:00"]);

  useEffect(() => {
    if (initialData) {
      set_dosage(initialData.dosage || "");
      set_instructions(initialData.instructions || "");
      
      const tpd = initialData.times_per_day;
      const tpdArr = [false, false, false, false];
      if (tpd >= 1 && tpd <= 3) tpdArr[tpd-1] = true;
      else tpdArr[3] = true;
      set_times_per_day_button_array(tpdArr);

      set_time(initialData.med_time || ["09:00"]);
      
      if (initialData.days) {
        const isWeekly = initialData.days.length < 7;
        set_recurrance_array([!isWeekly, isWeekly, false]);
        set_selected_days(fullDays.map(d => initialData.days.includes(d)));
      }
    }
  }, [initialData]);

  function finalsubmit(e) {
    e.preventDefault();
    const finalobject = {
      final_name: medname,
      final_dosage: dosage,
      final_instruction: instructions,
      final_timesperday: times_per_day_button_array,
      final_times: time,
      final_days: selected_days,
      isUpdate: !!initialData
    };
    closemodalfromchild(finalobject);
  }

  function handle_times_per_day_Recurrence(index) {
    let count = index === 3 ? 0 : index + 1;
    set_time(Array(count).fill(count > 0 ? "09:00" : ""));
    const arr = [false, false, false, false];
    arr[index] = true;
    set_times_per_day_button_array(arr);
  }

  function handle_reccurence_array(index) {
    if (index === 0) set_selected_days(fullDays.map(() => true));
    else set_selected_days(fullDays.map(() => false));
    
    const arr = [false, false, false];
    arr[index] = true;
    set_recurrance_array(arr);
  }

  function toggle_selected_day(index) {
    set_selected_days((prev) => prev.map((item, i) => i === index ? !item : item));
  }

  function setting_time(ind, e) {
    set_time((prev) => prev.map((t, i) => i === ind ? e.target.value : t));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900/90 border border-white/10 backdrop-blur-2xl w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{initialData ? "Update" : "Add"} {medname}</h2>
            <p className="text-gray-400 text-sm">Schedule details</p>
          </div>
          <button 
            onClick={() => closemodalfromchild(null)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={finalsubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Dosage</label>
              <input 
                type="text" 
                placeholder="e.g. 1 pill" 
                value={dosage} 
                onChange={(e) => set_dosage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Instruction</label>
              <input 
                type="text" 
                placeholder="e.g. After meal" 
                value={instructions} 
                onChange={(e) => set_instructions(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Frequency</label>
            <div className="flex bg-white/5 p-1 rounded-xl gap-1">
              {['1x', '2x', '3x', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_times_per_day_Recurrence(idx)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    times_per_day_button_array[idx] 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {time.map((t, index) => (
                <div key={index} className="relative group">
                  <input 
                    type="time"
                    value={t}
                    onChange={(e) => setting_time(index, e)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
            {times_per_day_button_array[3] && (
              <p className="text-xs text-blue-400 italic">Custom frequency coming soon...</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-green-400 uppercase tracking-wider">Recurrence</label>
            <div className="flex bg-white/5 p-1 rounded-xl gap-1">
              {['Daily', 'Weekly', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_reccurence_array(idx)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    recurrence_array[idx] 
                      ? "bg-green-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {recurrence_array[1] && (
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 mt-4">
                {days.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggle_selected_day(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      selected_days[index]
                        ? "bg-blue-500 text-white shadow-lg scale-110"
                        : "bg-white/5 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {recurrence_array[2] && (
              <p className="text-xs text-blue-400 italic">Custom recurrence coming soon...</p>
            )}
          </div>
        </form>

        <div className="p-6 bg-white/5 border-t border-white/5">
          <button 
            onClick={finalsubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <SaveIcon />
            {initialData ? "Update Medication" : "Save Medication"}
          </button>
        </div>
      </div>
    </div>
  );
}
//left-custom code