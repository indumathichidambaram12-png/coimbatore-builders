import React, { useState, useEffect } from 'react';
import { Plus, Wallet, Calculator, Calendar, Share } from 'lucide-react';
import { useLanguage } from '@/react-app/contexts/LanguageContext';
import { useApi, api } from '@/react-app/hooks/useApi';
import { PaymentType, WorkerType, ProjectType } from '@/shared/types';
import { sharePaymentOnWhatsApp, isWhatsAppAvailable } from '@/react-app/utils/whatsapp';

interface WageCalculation {
  workerId: number;
  workerName: string;
  dailyWage: number;
  fullDays: number;
  halfDays: number;
  totalDays: number;
  totalWages: number;
  startDate: string;
  endDate: string;
}

export default function Payments() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { data: payments, loading, execute: fetchPayments } = useApi<PaymentType[]>();
  const { data: workers, execute: fetchWorkers } = useApi<WorkerType[]>();
  const { data: projects, execute: fetchProjects } = useApi<ProjectType[]>();
  const { data: wageCalculation, execute: calculateWages } = useApi<WageCalculation>();
  const { execute: savePayment } = useApi<PaymentType>();

  const [formData, setFormData] = useState({
    worker_id: '',
    project_id: '',
    amount: '',
    payment_type: 'wage' as const,
    payment_date: new Date().toISOString().split('T')[0],
    payment_period_start: '',
    payment_period_end: '',
    status: 'unpaid' as const,
    notes: '',
  });

  const [calculatorData, setCalculatorData] = useState({
    worker_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedWorker) params.append('worker_id', selectedWorker);
    if (selectedProject) params.append('project_id', selectedProject);
    if (statusFilter) params.append('status', statusFilter);
    
    fetchPayments(() => api.get<PaymentType[]>(`/api/payments?${params.toString()}`));
    fetchWorkers(() => api.get<WorkerType[]>('/api/workers'));
    fetchProjects(() => api.get<ProjectType[]>('/api/projects'));
  }, [selectedWorker, selectedProject, statusFilter, fetchPayments, fetchWorkers, fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.worker_id || !formData.project_id || !formData.amount) return;

    try {
      const paymentData = {
        ...formData,
        worker_id: parseInt(formData.worker_id),
        project_id: parseInt(formData.project_id),
        amount: parseFloat(formData.amount),
      };

      await savePayment(() => api.post<PaymentType>('/api/payments', paymentData));
      setShowForm(false);
      resetForm();
      fetchPayments(() => api.get<PaymentType[]>('/api/payments'));
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleCalculateWages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatorData.worker_id || !calculatorData.start_date || !calculatorData.end_date) return;

    try {
      await calculateWages(() => 
        api.get<WageCalculation>(`/api/calculate-wages?worker_id=${calculatorData.worker_id}&start_date=${calculatorData.start_date}&end_date=${calculatorData.end_date}`)
      );
    } catch (error) {
      console.error('Error calculating wages:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      worker_id: '',
      project_id: '',
      amount: '',
      payment_type: 'wage',
      payment_date: new Date().toISOString().split('T')[0],
      payment_period_start: '',
      payment_period_end: '',
      status: 'unpaid',
      notes: '',
    });
  };

  const updatePaymentStatus = async (paymentId: number, status: 'paid' | 'unpaid') => {
    try {
      await api.put(`/api/payments/${paymentId}`, { status });
      fetchPayments(() => api.get<PaymentType[]>('/api/payments'));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleSharePayment = (payment: PaymentType) => {
    const worker = workers?.find(w => w.id === payment.worker_id);
    const project = projects?.find(p => p.id === payment.project_id);
    
    if (!worker || !project) return;

    sharePaymentOnWhatsApp({
      workerName: worker.name,
      amount: payment.amount,
      paymentType: payment.payment_type,
      paymentDate: payment.payment_date,
      projectName: project.name,
      phoneNumber: worker.phone_number,
    });
  };

  if (loading && !payments) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (showCalculator) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('payments.calculateWages')}
            </h2>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCalculateWages} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Worker *
              </label>
              <select
                value={calculatorData.worker_id}
                onChange={(e) => setCalculatorData({ ...calculatorData, worker_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Choose Worker</option>
                {workers?.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.labour_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={calculatorData.start_date}
                  onChange={(e) => setCalculatorData({ ...calculatorData, start_date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={calculatorData.end_date}
                  onChange={(e) => setCalculatorData({ ...calculatorData, end_date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Calculate Wages
            </button>
          </form>

          {wageCalculation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-900 mb-3">Wage Calculation Result</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>Worker:</strong> {wageCalculation.workerName}</p>
                <p><strong>Period:</strong> {wageCalculation.startDate} to {wageCalculation.endDate}</p>
                <p><strong>Daily Wage:</strong> ₹{wageCalculation.dailyWage}</p>
                <p><strong>Full Days:</strong> {wageCalculation.fullDays}</p>
                <p><strong>Half Days:</strong> {wageCalculation.halfDays}</p>
                <div className="pt-2 border-t border-green-300">
                  <p className="text-lg font-bold"><strong>Total Wages:</strong> ₹{wageCalculation.totalWages}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('payments.addPayment')}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Worker *
              </label>
              <select
                value={formData.worker_id}
                onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Choose Worker</option>
                {workers?.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.labour_type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Choose Project</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payments.amount')} * (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('payments.type')} *
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="wage">Wage</option>
                  <option value="advance">Advance</option>
                  <option value="bonus">Bonus</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {formData.payment_type === 'wage' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start {t('common.optional')}
                  </label>
                  <input
                    type="date"
                    value={formData.payment_period_start}
                    onChange={(e) => setFormData({ ...formData, payment_period_start: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End {t('common.optional')}
                  </label>
                  <input
                    type="date"
                    value={formData.payment_period_end}
                    onChange={(e) => setFormData({ ...formData, payment_period_end: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes {t('common.optional')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                {t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('payments.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCalculator(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedWorker}
          onChange={(e) => setSelectedWorker(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Workers</option>
          {workers?.map(worker => (
            <option key={worker.id} value={worker.id}>{worker.name}</option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Projects</option>
          {projects?.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments && payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{payment.worker_name}</h3>
                  <p className="text-sm text-gray-600">{payment.project_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">₹{payment.amount}</p>
                  <p className="text-xs text-gray-500">{payment.payment_type}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isWhatsAppAvailable() && (
                    <button
                      onClick={() => handleSharePayment(payment)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Share on WhatsApp"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => updatePaymentStatus(payment.id, payment.status === 'paid' ? 'unpaid' : 'paid')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {payment.status === 'paid' ? 'Paid' : 'Unpaid'}
                  </button>
                </div>
              </div>

              {payment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{payment.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('payments.noPayments')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
