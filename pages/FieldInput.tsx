
import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Send, Loader2, Wifi, WifiOff, RefreshCw, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FieldReport } from '../types';
import { analyzeFieldImage } from '../services/geminiService';

const STORAGE_KEY = 'offline_reports_queue';

const FieldInput: React.FC = () => {
  const { user, addReport } = useStore();
  
  // Form State
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<any>('تعداد أصوات');
  
  // UI/Processing State
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // Offline Mode State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState<FieldReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize: Load queue and set up listeners
  useEffect(() => {
    // Load existing queue
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPendingQueue(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse offline reports");
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineReports();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Logic
  const syncOfflineReports = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const reportsToSync: FieldReport[] = JSON.parse(saved);
    if (reportsToSync.length === 0) return;

    setIsSyncing(true);
    
    // Simulate sequential syncing
    for (const report of reportsToSync) {
      // Add a small delay to simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add a note that it was synced
      const syncedReport = {
        ...report,
        notes: report.notes + ' (Synced from Offline)',
        created_at: new Date().toISOString() // Update timestamp to sync time? Or keep original? Keeping original context is usually better, but for sorting we might check dates.
      };
      
      addReport(syncedReport);
    }

    // Clear queue
    localStorage.removeItem(STORAGE_KEY);
    setPendingQueue([]);
    setIsSyncing(false);
    alert(`تمت مزامنة ${reportsToSync.length} تقارير بنجاح.`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setImage(base64String);
        
        // Only run AI analysis if online
        if (isOnline) {
          setAnalyzing(true);
          const result = await analyzeFieldImage(
            base64Data, 
            "قم بتحليل هذه الصورة من مركز اقتراع في لبنان. هل هناك ازدحام؟ هل هناك مخالفات واضحة؟ صف المشهد بإيجاز."
          );
          setAiAnalysis(result);
          setNotes(prev => prev + (prev ? '\n\n' : '') + `[تحليل الذكاء الاصطناعي]: ${result}`);
          setAnalyzing(false);
        } else {
            setAiAnalysis("التحليل الذكي غير متوفر في وضع عدم الاتصال.");
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Mock Geo-location (If offline, we might rely on cached coords or omit)
    // In a real app, navigator.geolocation works offline if cached, or returns timeout.
    const mockLat = 33.8938 + (Math.random() - 0.5) * 0.05;
    const mockLng = 35.5018 + (Math.random() - 0.5) * 0.05;

    const report: FieldReport = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: user?.organization_id || 'org-123',
      user_id: user?.id || 'unknown',
      activity_type: activityType,
      metric_value: 0,
      notes: notes,
      latitude: mockLat,
      longitude: mockLng,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    if (isOnline) {
        // Normal Online Flow
        setTimeout(() => {
            addReport(report);
            resetForm();
            alert('تم إرسال التقرير بنجاح!');
        }, 1000);
    } else {
        // Offline Flow
        try {
            const currentQueue = [...pendingQueue, report];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentQueue));
            setPendingQueue(currentQueue);
            
            setTimeout(() => {
                resetForm();
                alert('لا يوجد انترنت. تم حفظ التقرير محلياً وسيتم إرساله عند استعادة الاتصال.');
            }, 500);
        } catch (error) {
            alert('خطأ: مساحة التخزين ممتلئة. لا يمكن حفظ التقرير.');
            setSubmitting(false);
        }
    }
  };

  const resetForm = () => {
      setSubmitting(false);
      setNotes('');
      setImage(null);
      setAiAnalysis('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Connectivity Status Bar */}
      <div className={`p-4 rounded-xl flex items-center justify-between shadow-lg transition-colors ${isOnline ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-red-900/20 border border-red-900/50'}`}>
         <div className="flex items-center gap-3">
             {isOnline ? <Wifi className="text-emerald-500" /> : <WifiOff className="text-red-500" />}
             <div>
                 <p className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                     {isOnline ? 'أنت متصل بالإنترنت' : 'أنت في وضع عدم الاتصال'}
                 </p>
                 <p className="text-xs text-slate-400">
                     {isOnline ? 'تتم المزامنة تلقائياً' : 'يتم حفظ التقارير في الجهاز محلياً'}
                 </p>
             </div>
         </div>
         {pendingQueue.length > 0 && (
             <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg">
                 {isSyncing ? <RefreshCw className="animate-spin text-blue-400" size={16} /> : <Save className="text-amber-400" size={16} />}
                 <span className="text-sm font-mono">{pendingQueue.length} معلق</span>
                 {isOnline && !isSyncing && (
                     <button onClick={syncOfflineReports} className="text-xs text-blue-400 hover:underline mr-2">مزامنة الآن</button>
                 )}
             </div>
         )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-right">
        <div className="flex items-center gap-3 mb-6 flex-row-reverse justify-end">
          <div>
            <h2 className="text-xl font-bold">تقرير ميداني جديد</h2>
            <p className="text-slate-400 text-sm">إدخال البيانات والملاحظات من الأرض</p>
          </div>
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <MapPin size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">نوع التقرير</label>
            <select 
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="تعداد أصوات">تعداد أصوات (فرز أولي)</option>
              <option value="خروقات">خروقات قانونية / رشاوى</option>
              <option value="استطلاع">استطلاع رأي الناخبين</option>
              <option value="لوجستيات">مشاكل لوجستية (كهرباء، انترنت)</option>
            </select>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">صورة / دليل</label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {image ? (
                <div className="relative">
                  <img src={image} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <Loader2 className="animate-spin text-blue-400 mx-auto mb-2" />
                        <span className="text-sm font-medium">جاري التحليل...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4">
                  <Camera className="mx-auto text-slate-500 mb-2" size={32} />
                  <p className="text-slate-400 text-sm">اضغط لالتقاط صورة أو رفع ملف</p>
                </div>
              )}
            </div>
            {aiAnalysis && (
               <div className={`p-3 border rounded-lg text-sm ${isOnline ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-200' : 'bg-amber-900/20 border-amber-900/50 text-amber-200'}`}>
                 <span className="font-bold">تحليل الذكاء الاصطناعي: </span> {aiAnalysis}
               </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">ملاحظات المندوب</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              placeholder="صف الوضع الحالي..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || analyzing}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                isOnline 
                ? 'bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                : 'bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
            }`}
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {isOnline ? <Send size={18} /> : <Save size={18} />} 
                {isOnline ? 'إرسال التقرير' : 'حفظ في القائمة (Offline)'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FieldInput;
