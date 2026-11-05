import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle,
  Loader2,
  Image,
  Sparkles
} from 'lucide-react';
import { SystemSettings as TSystemSettings } from '../types.js';

interface SystemSettingsProps {
  settings: TSystemSettings;
  onUpdateSettings: (settings: Partial<TSystemSettings>) => Promise<void>;
  onResetDatabase: () => Promise<void>;
  onRestoreDatabase: (backupData: any) => Promise<void>;
}

export default function SystemSettings({
  settings,
  onUpdateSettings,
  onResetDatabase,
  onRestoreDatabase
}: SystemSettingsProps) {
  const [fundName, setFundName] = useState(settings.fundName);
  const [monthlyContributionAmount, setMonthlyContributionAmount] = useState(settings.monthlyContributionAmount);
  const [currency, setCurrency] = useState(settings.currency);
  const [logo, setLogo] = useState(settings.logo);
  const [theme, setTheme] = useState(settings.theme);

  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fundName.trim()) {
      setErrorMsg('Fund Name is required.');
      return;
    }

    if (!currency.trim()) {
      setErrorMsg('Currency Symbol is required.');
      return;
    }

    if (monthlyContributionAmount <= 0) {
      setErrorMsg('Monthly contribution must be greater than zero.');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateSettings({
        fundName,
        monthlyContributionAmount: Number(monthlyContributionAmount),
        currency,
        logo,
        theme
      });
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update configurations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/database/backup';
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setPendingRestoreData(parsed);
        } catch (err) {
          alert('Invalid backup file. Ensure it is a valid FMF database backup JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFactoryReset = () => {
    setShowResetModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">System Settings</h1>
        <p className="text-xs text-gray-500 font-medium">Control institutional variables, backup critical transactions ledgers, and manage software restore points.</p>
      </div>

      {/* 2. Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Side: System variables Config */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 pb-3 dark:border-gray-800">
            <Settings className="h-4.5 w-4.5 text-teal-600" /> Operational Configurations
          </h2>

          <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
            {successMsg && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20">
                {errorMsg}
              </div>
            )}

            {/* Fund Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Fund Name</label>
              <input 
                type="text" 
                value={fundName} 
                onChange={(e) => setFundName(e.target.value)} 
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white font-medium"
              />
            </div>

            {/* Logo and currency */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Logo Text Prefix</label>
                <input 
                  type="text" 
                  value={logo} 
                  onChange={(e) => setLogo(e.target.value)} 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Base Currency Symbol</label>
                <input 
                  type="text" 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)} 
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                />
              </div>
            </div>

            {/* Default Monthly Target */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Global Monthly Contribution Amount</label>
              <input 
                type="number" 
                value={monthlyContributionAmount} 
                onChange={(e) => setMonthlyContributionAmount(Number(e.target.value))} 
                min={1}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
              />
            </div>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800 flex justify-end">
              <button 
                id="btn_submit_settings"
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />} Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Backups and Recovery logs */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          
          {/* Recovery and backups block */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 border-b border-gray-100 pb-3 dark:border-gray-800">
              <Download className="h-4.5 w-4.5 text-teal-600" /> Backups & Disaster Recovery
            </h2>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Export and download a standalone state representation. You can instantly restore this representation on any other system container deployment.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {/* Download Backup */}
              <button 
                id="btn_download_backup"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-150 bg-gray-50/30 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-white dark:bg-gray-900/50"
              >
                <Download className="h-4 w-4 text-teal-600" /> Export Database JSON
              </button>

              {/* Upload Restore */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleRestoreFileChange}
                accept=".json"
                className="hidden" 
              />
              <button 
                id="btn_upload_backup"
                onClick={handleRestoreClick}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-150 bg-gray-50/30 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-white dark:bg-gray-900/50"
              >
                <Upload className="h-4 w-4 text-cyan-600" /> Restore From Backup
              </button>
            </div>
          </div>

          {/* Database Reset block */}
          <div className="border-t border-gray-100 pt-5 dark:border-gray-800 space-y-3">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Danger Zone Action
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Resets the filesystem database to original demonstration seed vectors. All custom tables are purged immediately.
            </p>
            <button 
              id="btn_system_reset"
              onClick={handleFactoryReset}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 text-xs font-bold text-red-700 dark:bg-red-950/20 dark:border-red-900/30"
            >
              <RotateCcw className="h-4 w-4" /> Reset System to Demo Seeds
            </button>
          </div>

        </div>

      </div>

      {/* ==========================================
          SYSTEM RESET CONFIRMATION MODAL
      ========================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-950/50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Reset System Database</h3>
                <p className="text-xs text-gray-500 font-medium">Irreversible factory reset</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              URGENT WARNING: This action will reset the system database back to demo state. Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await onResetDatabase();
                    setShowResetModal(false);
                    window.location.reload();
                  } catch (e: any) {
                    alert(e.message || 'Failed to reset database.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          RESTORE BACKUP CONFIRMATION MODAL
      ========================================== */}
      {pendingRestoreData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-cyan-600 mb-3">
              <div className="rounded-full bg-cyan-100 p-3 dark:bg-cyan-950/50">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Restore Database Backup</h3>
                <p className="text-xs text-gray-500 font-medium">Overwrites current records</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Restoring from this backup file will replace the current database with the backup data. Proceed with restore?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setPendingRestoreData(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await onRestoreDatabase(pendingRestoreData);
                    setPendingRestoreData(null);
                    window.location.reload();
                  } catch (e: any) {
                    alert(e.message || 'Failed to restore database.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
