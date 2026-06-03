import React from "react"
import { X, Mail, Phone, Building2, UserCircle, Briefcase, Calendar, Shield, Activity } from "lucide-react"
import { StatusBadge } from "@/components/ui/admin"

export function UserDrawer({ user, open, onClose }: { user: any, open: boolean, onClose: () => void }) {
  if (!open) return null
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Header Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {user.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user.full_name}</h3>
              <p className="text-sm text-slate-500">{user.designation || "No Designation"}</p>
              <div className="mt-1">
                <StatusBadge value={user.is_active ? "active" : "inactive"} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400" />
                <span>{user.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Briefcase size={16} className="text-slate-400" />
                <span>{user.employee_id || "No Employee ID"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building2 size={16} className="text-slate-400" />
                <span>{user.department_name || "No Department"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Shield size={16} className="text-slate-400" />
                <span className="capitalize">{user.role?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Activity size={16} className="text-slate-400" />
                <span>Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">Account Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors">
                  Edit Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors">
                  Reset Password
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md font-medium transition-colors">
                  View Recent Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
