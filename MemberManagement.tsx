import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  UserCheck,
  UserMinus,
  Loader2,
  Camera
} from 'lucide-react';
import { Member } from '../types.js';

interface MemberManagementProps {
  members: Member[];
  onAddMember: (memberData: Omit<Member, 'id' | 'avatar'>) => Promise<void>;
  onUpdateMember: (id: string, memberData: Partial<Member>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  currencySymbol: string;
}

export default function MemberManagement({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  currencySymbol
}: MemberManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    monthlyContribution: 1000,
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
    avatar: ''
  });

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyContribution' ? Number(value) : value
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required.';
    if (!formData.phone.trim()) return 'Phone number is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'A valid email is required.';
    if (!formData.address.trim()) return 'Address is required.';
    if (formData.monthlyContribution <= 0) return 'Monthly contribution must be greater than zero.';
    if (!formData.joinDate) return 'Join date is required.';
    return '';
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      monthlyContribution: 1000,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: ''
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await onAddMember({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        monthlyContribution: formData.monthlyContribution,
        joinDate: formData.joinDate,
        status: formData.status
      });
      setIsAddModalOpen(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while saving member.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email,
      address: member.address,
      monthlyContribution: member.monthlyContribution,
      joinDate: member.joinDate,
      status: member.status,
      avatar: member.avatar
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await onUpdateMember(selectedMember.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        monthlyContribution: formData.monthlyContribution,
        joinDate: formData.joinDate,
        status: formData.status
      });
      setIsEditModalOpen(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error occurred while updating member.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (member: Member) => {
    const nextStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await onUpdateMember(member.id, { status: nextStatus });
    } catch (e) {
      alert('Failed to change member status.');
    }
  };

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">Member Directory</h1>
          <p className="text-xs text-gray-500">Manage directory records, statuses, contribution amounts and personal details.</p>
        </div>
        <button 
          id="btn_add_member"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 w-fit"
        >
          <UserPlus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input 
            id="input_member_search"
            type="text"
            placeholder="Search by name, ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-100 bg-gray-50/50 py-2 pl-9 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${statusFilter === f ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Members List Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-400 dark:border-gray-800">
            No members match your search criteria.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-gray-900 ${
                member.status === 'active' ? 'border-gray-100 dark:border-gray-800' : 'border-red-100 bg-red-50/5 dark:border-red-950/10'
              }`}
            >
              {/* Member Card Inner */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {member.avatar && member.avatar.startsWith('data:') ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 font-bold text-white shadow-sm">
                      {member.avatar}
                    </div>
                  )}

                  <div>
                    <span className="font-mono text-[9px] font-bold text-gray-400">ID: {member.id}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <button 
                      onClick={() => handleStatusToggle(member)}
                      className={`mt-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        member.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      {member.status === 'active' ? <UserCheck className="h-2.5 w-2.5" /> : <UserMinus className="h-2.5 w-2.5" />}
                      {member.status}
                    </button>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => openEditModal(member)}
                    className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-teal-50 hover:text-teal-600 dark:bg-gray-800 dark:text-gray-400"
                    title="Edit Record"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(member)}
                    className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400"
                    title="Delete Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Member Meta details */}
              <div className="mt-5 space-y-2 border-t border-gray-50 pt-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{member.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Joined: {member.joinDate}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 font-bold text-gray-800 dark:text-white">
                  <CreditCard className="h-3.5 w-3.5 text-teal-600" />
                  <span>Monthly Contribution: <span className="text-teal-600">{currencySymbol}{member.monthlyContribution.toLocaleString()}</span></span>
                </div>
              </div>

              {/* Inactive overlay indicator */}
              {member.status === 'inactive' && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[8px] font-bold text-red-700 dark:bg-red-950/80">
                  <X className="h-2 w-2" /> DEACTIVATED
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ==========================================
          ADD MEMBER MODAL DIALOG
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Register New Member</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Sazzad Hossain"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* Contact Information (Grid) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 01712345678"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="e.g. sazzad@gmail.com"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Address</label>
                <textarea 
                  name="address" 
                  rows={2}
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Dhanmondi, Dhaka"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white resize-none"
                />
              </div>

              {/* Setup Configuration Variables */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Monthly Contribution Amount</label>
                  <input 
                    type="number" 
                    name="monthlyContribution" 
                    value={formData.monthlyContribution} 
                    onChange={handleInputChange} 
                    min={1}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Joining Date</label>
                  <input 
                    type="date" 
                    name="joinDate" 
                    value={formData.joinDate} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  id="btn_submit_add_member"
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />} Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          EDIT MEMBER MODAL DIALOG
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-950 dark:text-white">Edit Member Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 dark:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/30">
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Address</label>
                <textarea 
                  name="address" 
                  rows={2}
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white resize-none"
                />
              </div>

              {/* Setup Configuration */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Monthly Contribution Amount</label>
                  <input 
                    type="number" 
                    name="monthlyContribution" 
                    value={formData.monthlyContribution} 
                    onChange={handleInputChange} 
                    min={1}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Joining Date</label>
                  <input 
                    type="date" 
                    name="joinDate" 
                    value={formData.joinDate} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  id="btn_submit_edit_member"
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE MEMBER CONFIRMATION MODAL
      ========================================== */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Member Record</h3>
                <p className="text-xs text-gray-500">Confirm member directory removal</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete member <span className="font-bold text-gray-900 dark:text-white">{memberToDelete.name}</span> (<span className="font-mono font-bold text-teal-600">{memberToDelete.id}</span>)?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMemberToDelete(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDeleteMember(memberToDelete.id);
                    setMemberToDelete(null);
                  } catch (e: any) {
                    alert(e.message || 'Failed to delete member.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
