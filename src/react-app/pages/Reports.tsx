import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Users, 
  Wallet,
  Building2,
  BarChart3
} from 'lucide-react';

import { useApi, api } from '@/react-app/hooks/useApi';
import { WorkerType, ProjectType, AttendanceType, PaymentType } from '@/shared/types';

interface ReportData {
  workers: WorkerType[];
  projects: ProjectType[];
  attendance: AttendanceType[];
  payments: PaymentType[];
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  projectId: string;
  workerId: string;
  reportType: 'attendance' | 'payments' | 'summary' | 'wages';
}

export default function Reports() {
  const { data: reportData, loading, execute: fetchReportData } = useApi<ReportData>();
  
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0],
    projectId: '',
    workerId: '',
    reportType: 'summary',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.projectId) params.append('project_id', filters.projectId);
    if (filters.workerId) params.append('worker_id', filters.workerId);

    await fetchReportData(async () => {
      const [workers, projects, attendance, payments] = await Promise.all([
        api.get<WorkerType[]>('/api/workers'),
        api.get<ProjectType[]>('/api/projects'),
        api.get<AttendanceType[]>(`/api/attendance?${params.toString()}`),
        api.get<PaymentType[]>(`/api/payments?${params.toString()}`),
      ]);

      return { workers, projects, attendance, payments };
    });
  };

  const generatePDF = async (reportType: string) => {
    if (!reportData) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Coimbatore Builders Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Report Type: ${reportType}`, 20, 35);
      doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 20, 45);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 55);

      let yPosition = 70;

      if (reportType === 'attendance') {
        doc.setFontSize(16);
        doc.text('Attendance Report', 20, yPosition);
        yPosition += 20;

        const attendanceStats = calculateAttendanceStats();
        doc.setFontSize(12);
        doc.text(`Total Present Days: ${attendanceStats.totalPresent}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Half Days: ${attendanceStats.totalHalf}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Absent Days: ${attendanceStats.totalAbsent}`, 20, yPosition);
        yPosition += 20;

        // Attendance details
        const attendanceByWorker = reportData.attendance.reduce((acc, att) => {
          const worker = reportData.workers.find(w => w.id === att.worker_id);
          if (worker) {
            if (!acc[worker.name]) {
              acc[worker.name] = { full: 0, half: 0, absent: 0 };
            }
            acc[worker.name][att.status as keyof typeof acc[string]]++;
          }
          return acc;
        }, {} as Record<string, { full: number; half: number; absent: number }>);

        Object.entries(attendanceByWorker).forEach(([workerName, stats]) => {
          doc.text(`${workerName}: Full=${stats.full}, Half=${stats.half}, Absent=${stats.absent}`, 20, yPosition);
          yPosition += 10;
        });

      } else if (reportType === 'payments') {
        doc.setFontSize(16);
        doc.text('Payment Report', 20, yPosition);
        yPosition += 20;

        const paymentStats = calculatePaymentStats();
        doc.setFontSize(12);
        doc.text(`Total Wages Paid: ₹${paymentStats.totalWages}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total Advances: ₹${paymentStats.totalAdvances}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Pending Payments: ₹${paymentStats.pendingAmount}`, 20, yPosition);
        yPosition += 20;

        // Payment details
        reportData.payments.forEach((payment) => {
          const worker = reportData.workers.find(w => w.id === payment.worker_id);
          if (worker) {
            doc.text(`${worker.name}: ₹${payment.amount} (${payment.payment_type}) - ${payment.status}`, 20, yPosition);
            yPosition += 10;
          }
        });

      } else if (reportType === 'wages') {
        doc.setFontSize(16);
        doc.text('Wage Calculation Report', 20, yPosition);
        yPosition += 20;

        const wageCalculations = calculateWagesByWorker();
        Object.entries(wageCalculations).forEach(([workerName, wage]) => {
          doc.text(`${workerName}: ₹${wage}`, 20, yPosition);
          yPosition += 10;
        });
      }

      // Save PDF
      doc.save(`coimbatore-builders-${reportType}-${filters.startDate}-to-${filters.endDate}.pdf`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  const exportCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (filters.reportType === 'attendance') {
      headers = ['Worker Name', 'Project', 'Date', 'Status', 'Hours Worked'];
      rows = reportData.attendance.map(att => {
        const worker = reportData.workers.find(w => w.id === att.worker_id);
        const project = reportData.projects.find(p => p.id === att.project_id);
        return [
          worker?.name || '',
          project?.name || '',
          att.attendance_date,
          att.status,
          att.hours_worked || ''
        ];
      });
    } else if (filters.reportType === 'payments') {
      headers = ['Worker Name', 'Project', 'Amount', 'Type', 'Date', 'Status'];
      rows = reportData.payments.map(pay => {
        const worker = reportData.workers.find(w => w.id === pay.worker_id);
        const project = reportData.projects.find(p => p.id === pay.project_id);
        return [
          worker?.name || '',
          project?.name || '',
          pay.amount,
          pay.payment_type,
          pay.payment_date,
          pay.status
        ];
      });
    }

    csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coimbatore-builders-${filters.reportType}-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateAttendanceStats = () => {
    if (!reportData?.attendance) return { totalPresent: 0, totalHalf: 0, totalAbsent: 0 };
    
    return reportData.attendance.reduce((acc, att) => {
      if (att.status === 'full') acc.totalPresent++;
      else if (att.status === 'half') acc.totalHalf++;
      else acc.totalAbsent++;
      return acc;
    }, { totalPresent: 0, totalHalf: 0, totalAbsent: 0 });
  };

  const calculatePaymentStats = () => {
    if (!reportData?.payments) return { totalWages: 0, totalAdvances: 0, pendingAmount: 0 };
    
    return reportData.payments.reduce((acc, pay) => {
      if (pay.payment_type === 'wage') acc.totalWages += pay.amount;
      if (pay.payment_type === 'advance') acc.totalAdvances += pay.amount;
      if (pay.status === 'unpaid') acc.pendingAmount += pay.amount;
      return acc;
    }, { totalWages: 0, totalAdvances: 0, pendingAmount: 0 });
  };

  const calculateWagesByWorker = () => {
    if (!reportData?.attendance || !reportData?.workers) return {};
    
    const wagesByWorker: Record<string, number> = {};
    
    reportData.attendance.forEach(att => {
      const worker = reportData.workers.find(w => w.id === att.worker_id);
      if (worker) {
        if (!wagesByWorker[worker.name]) wagesByWorker[worker.name] = 0;
        
        if (att.status === 'full') {
          wagesByWorker[worker.name] += worker.daily_wage;
        } else if (att.status === 'half') {
          wagesByWorker[worker.name] += worker.daily_wage * 0.5;
        }
      }
    });
    
    return wagesByWorker;
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-32"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const paymentStats = calculatePaymentStats();

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Reports & Analytics
      </h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Type
            </label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="summary">Summary</option>
              <option value="attendance">Attendance</option>
              <option value="payments">Payments</option>
              <option value="wages">Wage Calculation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Projects</option>
              {reportData?.projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Workers</p>
              <p className="text-2xl font-bold">{reportData?.workers.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Present Days</p>
              <p className="text-2xl font-bold">{attendanceStats.totalPresent}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Wages</p>
              <p className="text-2xl font-bold">₹{paymentStats.totalWages}</p>
            </div>
            <Wallet className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Projects</p>
              <p className="text-2xl font-bold">{reportData?.projects.length || 0}</p>
            </div>
            <Building2 className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generatePDF(filters.reportType)}
            className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 py-3 px-4 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          
          <button
            onClick={exportCSV}
            className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 py-3 px-4 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Detailed Report Content */}
      {filters.reportType === 'summary' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary Report</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Attendance Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Full Days:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{attendanceStats.totalPresent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Half Days:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{attendanceStats.totalHalf}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Absent Days:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{attendanceStats.totalAbsent}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Payment Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Wages:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{paymentStats.totalWages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Advances:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{paymentStats.totalAdvances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending Amount:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">₹{paymentStats.pendingAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional report content based on type */}
      {/* This would be expanded with more detailed views for each report type */}
    </div>
  );
}
