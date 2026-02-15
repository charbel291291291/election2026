
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, UserPlus, Trash2, RotateCcw, Crown } from 'lucide-react';
import UpgradeModal from '../components/UpgradeModal';
import { UserRole } from '../types';

const TeamManagement: React.FC = () => {
  const { organization, organizationUsers, addUser, deleteUser, resetUserPin } = useStore();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.FIELD_AGENT);
  const [newPin, setNewPin] = useState('');

  const usersCount = organizationUsers.length;
  const maxUsers = organization?.max_users || 5;
  const usagePercentage = (usersCount / maxUsers) * 100;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addUser({
        full_name: newName,
        phone_number: newPhone,
        role: newRole,
        pin_hash: newPin
    });

    if (result.success) {
        setNewName('');
        setNewPhone('');
        setNewPin('');
        setIsAdding(false);
        alert('تم إضافة المستخدم بنجاح');
    } else if (result.error === 'limit_reached') {
        setShowUpgradeModal(true);
    } else if (result.error === 'exists') {
        alert('رقم الهاتف مسجل مسبقاً');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-blue-500" /> إدارة فريق العمل
          </h1>
          <p className="text-slate-400">إدارة المستخدمين، الصلاحيات، واشتراك المنظمة.</p>
        </div>
        
        {/* Subscription Badge */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center gap-4">
             <div>
                 <p className="text-xs text-slate-400">الخطة الحالية</p>
                 <div className="flex items-center gap-1 font-bold text-white uppercase">
                    <Crown size={14} className="text-yellow-500" /> {organization?.subscription_plan}
                 </div>
             </div>
             <div className="w-px h-8 bg-slate-700"></div>
             <div>
                 <p className="text-xs text-slate-400 mb-1">المستخدمين ({usersCount}/{maxUsers})</p>
                 <div className="w-32 bg-slate-700 h-2 rounded-full overflow-hidden">
                     <div 
                        className={`h-full ${usagePercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                     ></div>
                 </div>
             </div>
        </div>
      </div>

      {/* Add User Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
         <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-white">إضافة عضو جديد</h3>
             <button 
               onClick={() => setIsAdding(!isAdding)}
               className="text-sm text-blue-400 hover:text-blue-300"
             >
               {isAdding ? 'إلغاء' : 'فتح النموذج'}
             </button>
         </div>

         {isAdding && (
             <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">الاسم الكامل</label>
                     <input value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="الاسم" />
                 </div>
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">رقم الهاتف</label>
                     <input value={newPhone} onChange={e => setNewPhone(e.target.value)} required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="70xxxxxx" dir="ltr" />
                 </div>
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">الدور (Role)</label>
                     <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                         <option value={UserRole.FIELD_AGENT}>مندوب ميداني</option>
                         <option value={UserRole.MANAGER}>منسق منطقة</option>
                         <option value={UserRole.ADMIN}>مدير نظام</option>
                         <option value={UserRole.VIEWER}>مراقب (للقراءة فقط)</option>
                     </select>
                 </div>
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">PIN Code</label>
                     <input value={newPin} onChange={e => setNewPin(e.target.value)} required maxLength={6} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center tracking-widest" placeholder="0000" />
                 </div>
                 <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                     <UserPlus size={18} /> إضافة
                 </button>
             </form>
         )}
      </div>

      {/* Users List */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-right text-sm">
              <thead className="bg-slate-900 text-slate-400 font-medium">
                  <tr>
                      <th className="p-4">الاسم</th>
                      <th className="p-4">الدور</th>
                      <th className="p-4">الهاتف</th>
                      <th className="p-4">تاريخ الانضمام</th>
                      <th className="p-4">إجراءات</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                  {organizationUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-700/30">
                          <td className="p-4 font-bold text-white">{u.full_name}</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs border ${
                                  u.role === UserRole.ADMIN ? 'border-red-500 text-red-400 bg-red-900/10' :
                                  u.role === UserRole.MANAGER ? 'border-purple-500 text-purple-400 bg-purple-900/10' :
                                  'border-slate-500 text-slate-400 bg-slate-900/10'
                              }`}>
                                  {u.role}
                              </span>
                          </td>
                          <td className="p-4 font-mono text-slate-300" dir="ltr">{u.phone_number}</td>
                          <td className="p-4 text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                          <td className="p-4 flex gap-2">
                              <button 
                                onClick={() => resetUserPin(u.id, '0000')}
                                title="Reset PIN to 0000"
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                              >
                                  <RotateCcw size={16} />
                              </button>
                              <button 
                                onClick={() => deleteUser(u.id)}
                                title="Delete User"
                                className="p-2 bg-red-900/20 hover:bg-red-900/40 rounded text-red-400"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default TeamManagement;
