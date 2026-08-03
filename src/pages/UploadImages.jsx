// src/pages/UploadImages.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  UploadCloud,
  Image,
  Trash2,
  Cpu,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function UploadImages() {
  const [studies, setStudies] = useState([]);
  const [selectedStudyId, setSelectedStudyId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      const res = await api.get('/studies');
      if (res.data.success) {
        setStudies(res.data.data);
        const params = new URLSearchParams(location.search);
        const studyParam = params.get('study_id');
        if (studyParam) {
          setSelectedStudyId(studyParam);
        } else if (res.data.data.length > 0) {
          setSelectedStudyId(res.data.data[0].study_id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const filePreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(filePreviews);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedStudyId) {
      setError('Please select a USG study');
      return;
    }

    if (selectedFiles.length === 0) {
      // Allow loading sample DICOM/USG frames if no file was attached
      const defaultSamples = [
        'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
      ];
      return uploadPresetUrls(defaultSamples);
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('study_id', selectedStudyId);
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUploadedImages(res.data.data.images);
        const count = res.data.data.images.length;
        setSuccessMsg(`${count} Ultrasound frame(s) uploaded successfully!`);
        toast.success(`${count} Ultrasound frame(s) uploaded successfully!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload images';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const uploadPresetUrls = async (urls) => {
    setError('');
    setUploading(true);

    try {
      const res = await api.post('/images/upload', {
        study_id: selectedStudyId,
        image_urls: urls
      });

      if (res.data.success) {
        setUploadedImages(res.data.data.images);
        setSuccessMsg(`${urls.length} Sample USG DICOM frame(s) attached successfully!`);
        toast.success(`${urls.length} Sample USG DICOM frame(s) attached!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to attach sample frames';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const triggerAI = async () => {
    if (!selectedStudyId) return;
    setAnalyzing(true);
    setError('');

    try {
      const res = await api.post('/ai/analyze-study', { study_id: Number(selectedStudyId) });
      if (res.data.success) {
        setSuccessMsg('AI Draft Analysis generated! Redirecting to Reporting Workspace...');
        toast.success('AI Draft Analysis generated!');
        setTimeout(() => {
          navigate(`/workspace/${selectedStudyId}`);
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI Analysis failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ultrasound Image Capture & Staging</h1>
        <p className="text-xs text-gray-500 mt-0.5">Upload multi-frame USG images and initiate AI draft findings engine</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={triggerAI}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs"
          >
            Launch AI Engine →
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
        
        {/* Study Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Target USG Study *</label>
          <select
            value={selectedStudyId}
            onChange={e => setSelectedStudyId(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            {studies.map(s => (
              <option key={s.study_id} value={s.study_id}>
                [{s.study_code}] {s.patient_name} ({s.patient_uhid}) — {s.study_type} ({s.priority})
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Dropzone */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">Upload Ultrasound Capture Files</label>
          <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-gray-50/50 transition-colors">
            <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-800">Drag and drop USG image frames here</p>
            <p className="text-[11px] text-gray-500 mt-1">Supports JPG, PNG, DICOM frames up to 15MB per file</p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            
            <div className="mt-4 flex items-center justify-center space-x-3">
              <label
                htmlFor="file-input"
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-xl cursor-pointer shadow-2xs transition-all"
              >
                Browse Files
              </label>

              <button
                type="button"
                onClick={() => uploadPresetUrls([
                  'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
                ])}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-all"
              >
                Attach Sample Diagnostic Frames
              </button>
            </div>
          </div>
        </div>

        {/* Selected Previews Grid */}
        {previews.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-800 mb-3">Selected Frames ({previews.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 bg-black aspect-video">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                    Frame #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {uploading ? 'Staging Images...' : 'Upload Ultrasound Frames'}
          </button>

          <button
            onClick={triggerAI}
            disabled={analyzing}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>{analyzing ? 'Running AI Inference...' : 'Trigger AI Draft Analysis'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
