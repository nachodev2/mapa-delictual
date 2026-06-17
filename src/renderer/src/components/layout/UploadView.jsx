/* eslint-disable prettier/prettier */
import { useState } from 'react'
import * as XLSX from 'xlsx'

// ==========================================
// ÍCONOS NATIVOS EN SVG (A prueba de fallos)
// ==========================================
const IconUpload = ({ size = 24, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>;
const IconFile = ({ size = 24, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconCheck = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconAlert = ({ size = 18, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconTrash = ({ size = 18, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconDatabase = ({ size = 18, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconLoader = ({ size = 24, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

export default function UploadView() {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileInfo, setFileInfo] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [error, setError] = useState('')

  // ==========================================
  // LÓGICA DE ARRASTRAR Y SOLTAR
  // ==========================================
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) procesarArchivo(droppedFile)
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) procesarArchivo(selectedFile)
  }

  // ==========================================
  // MOTOR DE LECTURA DE EXCEL
  // ==========================================
  const procesarArchivo = (file) => {
    setError('')
    
    // Validar formato
    const extension = file.name.split('.').pop().toLowerCase()
    if (extension !== 'xlsx' && extension !== 'xls') {
      setError('Formato no válido. Por favor subí un archivo de Excel (.xlsx o .xls)')
      return
    }

    setIsProcessing(true)
    setFileInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' })

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Leer la primera hoja del Excel
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convertir la hoja a un array de objetos JSON (fila por fila)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
        
        if (jsonData.length === 0) {
          setError('El archivo Excel parece estar vacío.')
          setExcelData([])
        } else {
          setExcelData(jsonData)
        }
      } catch (err) {
        console.error(err)
        setError('Ocurrió un error al intentar leer el archivo. Verificá que no esté corrupto.')
      } finally {
        setIsProcessing(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const limpiarDatos = () => {
    setFileInfo(null)
    setExcelData([])
    setError('')
  }

  return (
    <div className="absolute inset-0 bg-[#0f172a] p-8 overflow-y-auto custom-scrollbar">
      
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* CABECERA */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <IconDatabase className="text-blue-500" size={28} />
            Ingesta de Datos Operativos
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Arrastrá el archivo Excel (.xlsx) exportado desde el sistema de comisarías para alimentar la base de datos geo-táctica.
          </p>
        </div>

        {/* DROPZONE */}
        {!fileInfo ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out
              ${isDragging 
                ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-600'
              }
            `}
          >
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileInput} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title=""
            />
            
            <div className="flex flex-col items-center text-center pointer-events-none">
              <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                <IconUpload size={40} />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1">
                Arrastrá y soltá tu Excel aquí
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                o hacé clic en este área para explorar tus archivos. Solo se permiten formatos .xlsx o .xls
              </p>
            </div>
          </div>
        ) : (
          /* ESTADO: ARCHIVO CARGADO */
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-lg border border-emerald-500/30 text-emerald-400">
                <IconFile size={28} />
              </div>
              <div>
                <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                  {fileInfo.name}
                  <IconCheck size={16} className="text-emerald-500" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">Peso: {fileInfo.size} • Registros leídos: {excelData.length}</p>
              </div>
            </div>
            
            <button 
              onClick={limpiarDatos}
              className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all"
              title="Quitar archivo"
            >
              <IconTrash size={18} />
            </button>
          </div>
        )}

        {/* MENSAJES DE ERROR / CARGA */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3 text-sm">
            <IconAlert size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 text-blue-400 p-8">
            <IconLoader size={24} className="animate-spin" />
            <span className="font-medium tracking-wide">Leyendo y estructurando datos...</span>
          </div>
        )}

        {/* VISTA PREVIA DE DATOS */}
        {excelData.length > 0 && !isProcessing && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300">Vista Previa de Columnas Detectadas</h3>
              <span className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded border border-blue-500/30">
                Mostrando primeras 5 filas
              </span>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-900/80 uppercase text-[10px] tracking-widest text-slate-500 border-b border-slate-800">
                  <tr>
                    {Object.keys(excelData[0]).map((header, idx) => (
                      <th key={idx} className="px-6 py-3 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {excelData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-800/30">
                      {Object.values(row).map((val, colIndex) => (
                        <td key={colIndex} className="px-6 py-3.5 text-slate-400">
                          {val !== null && val !== undefined ? String(val) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTÓN PARA ENVIAR A BD */}
            <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-end">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all">
                <IconDatabase size={18} />
                Sincronizar {excelData.length} registros a la Base de Datos
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}