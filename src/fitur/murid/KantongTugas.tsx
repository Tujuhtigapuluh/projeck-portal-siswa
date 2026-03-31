import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getClasses,
  getOnlineAssignmentsByClass,
  getStudents,
  getSubmissionByAssignmentAndStudent,
  upsertAssignmentSubmission,
} from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { FileUp, Send } from 'lucide-react';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export default function TaskPouchPage() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [answerText, setAnswerText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const student = useMemo(() => getStudents().find(item => item.id === user?.id), [user, storeVersion]);
  const classRoom = useMemo(() => {
    if (!student) return undefined;
    return getClasses().find(item => item.id === student.classId);
  }, [student, storeVersion]);

  const assignments = useMemo(() => {
    if (!student) return [];
    return getOnlineAssignmentsByClass(student.classId);
  }, [student, storeVersion]);

  const selectedTask = useMemo(
    () => assignments.find(item => item.id === selectedTaskId),
    [assignments, selectedTaskId],
  );

  const existingSubmission = useMemo(() => {
    if (!user || !selectedTask) return null;
    return getSubmissionByAssignmentAndStudent(selectedTask.id, user.id);
  }, [selectedTask, user, storeVersion]);

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSaveMessage('');
    const task = assignments.find(item => item.id === taskId);
    if (!task || !user) {
      setAnswerText('');
      setSelectedFile(null);
      return;
    }

    const previous = getSubmissionByAssignmentAndStudent(task.id, user.id);
    setAnswerText(previous?.answerText || '');
    setSelectedFile(null);
  };

  const handleSubmitAnswer = async () => {
    if (!user || !selectedTask || !answerText.trim()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const attachmentDataUrl = selectedFile ? await readFileAsDataUrl(selectedFile) : existingSubmission?.attachmentDataUrl;
      const attachmentName = selectedFile ? selectedFile.name : existingSubmission?.attachmentName;

      upsertAssignmentSubmission({
        id: existingSubmission?.id || `sub_${Date.now()}`,
        assignmentId: selectedTask.id,
        studentId: user.id,
        answerText: answerText.trim(),
        attachmentName,
        attachmentDataUrl,
        submittedAt: Date.now(),
      });
      setSaveMessage('Jawaban tugas berhasil disimpan.');
      setSelectedFile(null);
    } catch (error) {
      setSaveMessage('Terjadi kendala saat menyimpan file. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
     <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Kantong Tugas</h1>
		<p className="text-sm text-gray-500 mt-1">
        Kelas {classRoom?.name || '-'} - Kumpulkan jawaban tugas online dari guru.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Daftar Tugas</h2>
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {assignments.map(task => {
              const submitted = user ? getSubmissionByAssignmentAndStudent(task.id, user.id) : null;
              return (
                <button
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className={`w-full text-left border rounded-lg p-3 transition ${
                    selectedTaskId === task.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Batas pengumpulan: {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('id-ID')}</p>
                  <p className={`text-xs mt-1 ${submitted ? 'text-green-600' : 'text-gray-500'}`}>
                    {submitted ? `Sudah dikumpulkan ${new Date(submitted.submittedAt).toLocaleString('id-ID')}` : 'Belum dikumpulkan'}
                  </p>
                </button>
              );
            })}
            {assignments.length === 0 && <p className="text-sm text-gray-400">Belum ada tugas online untuk kelas ini.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          {!selectedTask && <p className="text-sm text-gray-500">Pilih tugas di sebelah kiri untuk melihat detail dan mengumpulkan jawaban.</p>}

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800">{selectedTask.title}</h2>
                <p className="text-xs text-gray-500 mt-1">Batas pengumpulan: {new Date(`${selectedTask.dueDate}T00:00:00`).toLocaleDateString('id-ID')}</p>
                <p className="text-sm text-gray-700 mt-3">{selectedTask.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban</label>
                <textarea
                  value={answerText}
                  onChange={event => setAnswerText(event.target.value)}
                  rows={8}
                  placeholder="Tulis jawaban tugas di sini..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (opsional)</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                    <FileUp className="w-4 h-4" /> Pilih File
                    <input
                      type="file"
                      onChange={event => setSelectedFile(event.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-500 truncate">
                    {selectedFile?.name || existingSubmission?.attachmentName || 'Belum ada file'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={isSaving || !answerText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Kumpulkan Jawaban'}
              </button>

              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}