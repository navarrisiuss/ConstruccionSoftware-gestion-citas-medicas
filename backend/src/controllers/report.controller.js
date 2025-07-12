const db = require('../config/db.config');
const fs = require('fs');
const path = require('path');

// Generar reporte de citas por rango de fechas
exports.generateAppointmentsReport = async (req, res) => {
  try {
    const { startDate, endDate, physicianId, specialty, status } = req.body;
    let query = `
    SELECT 
      a.id,
      a.date,
      a.time,
      a.status,
      a.priority,
      a.reason,
      a.created_at,
      a.notes,
      CONCAT(p.name, ' ', p.paternalLastName, ' ', p.maternalLastName) as patient_name,
      p.rut as patient_rut,
      p.phone as patient_phone,
      p.email as patient_email,
      CONCAT(ph.name, ' ', ph.paternalLastName, ' ', ph.maternalLastName) as physician_name,
      ph.specialty as physician_specialty
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN physicians ph ON a.physician_id = ph.id
    WHERE a.date BETWEEN ? AND ?
  `;
    
    const params = [startDate, endDate];
    
    // Agregar filtros opcionales
    if (physicianId && physicianId !== '') {
      query += ' AND a.physician_id = ?';
      params.push(physicianId);
    }
    
    if (specialty && specialty !== '') {
      query += ' AND ph.specialty = ?';
      params.push(specialty);
    }
    
    if (status && status !== '') {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY a.date DESC, a.time DESC';
    
    const [appointments] = await db.query(query, params);
    
    // ✅ ESTADÍSTICAS CORREGIDAS
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM appointments WHERE date BETWEEN ? AND ?)), 2) as percentage
      FROM appointments 
      WHERE date BETWEEN ? AND ?
      GROUP BY status
    `;
    
    const [stats] = await db.query(statsQuery, [startDate, endDate, startDate, endDate]);
    
    // Estadísticas por especialidad
    const specialtyStatsQuery = `
      SELECT 
        ph.specialty,
        COUNT(*) as count,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments a
      LEFT JOIN physicians ph ON a.physician_id = ph.id
      WHERE a.date BETWEEN ? AND ?
      GROUP BY ph.specialty
      ORDER BY count DESC
    `;
    
    const [specialtyStats] = await db.query(specialtyStatsQuery, [startDate, endDate]);
    
    // Estadísticas por médico
    const physicianStatsQuery = `
      SELECT 
        CONCAT(ph.name, ' ', ph.paternalLastName, ' ', ph.maternalLastName) as physician_name,
        ph.specialty,
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show
      FROM appointments a
      LEFT JOIN physicians ph ON a.physician_id = ph.id
      WHERE a.date BETWEEN ? AND ?
      GROUP BY a.physician_id, ph.name, ph.paternalLastName, ph.maternalLastName, ph.specialty
      ORDER BY total_appointments DESC
    `;
    
    const [physicianStats] = await db.query(physicianStatsQuery, [startDate, endDate]);
    
    const reportData = {
      reportInfo: {
        type: 'appointments',
        generatedAt: new Date().toISOString(),
        dateRange: { startDate, endDate },
        filters: { physicianId, specialty, status },
        totalRecords: appointments.length
      },
      appointments,
      statistics: {
        statusDistribution: stats,
        specialtyBreakdown: specialtyStats,
        physicianPerformance: physicianStats
      }
    };
    
    res.json(reportData);
    
  } catch (error) {
    console.error('Error generando reporte de citas:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ CORREGIR: Generar reporte de médicos
exports.generatePhysiciansReport = async (req, res) => {
  try {
    const { specialty } = req.body;
    
    // ✅ CONSULTA CORREGIDA sin license_number que no existe
    let query = `
      SELECT 
        ph.id,
        ph.name,
        ph.paternalLastName,
        ph.maternalLastName,
        ph.email,
        ph.specialty,
        COUNT(a.id) as total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN a.date >= CURDATE() THEN 1 END) as upcoming_appointments
      FROM physicians ph
      LEFT JOIN appointments a ON ph.id = a.physician_id
    `;
    
    const params = [];
    
    if (specialty && specialty !== '') {
      query += ' WHERE ph.specialty = ?';
      params.push(specialty);
    }
    
    query += ' GROUP BY ph.id ORDER BY ph.specialty, ph.paternalLastName';
    
    const [physicians] = await db.query(query, params);
    
    // Estadísticas generales
    const generalStatsQuery = `
      SELECT 
        specialty,
        COUNT(*) as physician_count
      FROM physicians 
      ${specialty ? 'WHERE specialty = ?' : ''}
      GROUP BY specialty
      ORDER BY physician_count DESC
    `;
    
    const [generalStats] = await db.query(generalStatsQuery, specialty ? [specialty] : []);
    
    const reportData = {
      reportInfo: {
        type: 'physicians',
        generatedAt: new Date().toISOString(),
        filters: { specialty },
        totalRecords: physicians.length
      },
      physicians,
      statistics: {
        specialtyDistribution: generalStats
      }
    };
    
    res.json(reportData);
    
  } catch (error) {
    console.error('Error generando reporte de médicos:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ CORREGIR: Generar reporte de pacientes
exports.generatePatientsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // ✅ CONSULTA CORREGIDA sin created_at que no existe en patients
    let query = `
      SELECT 
        p.id,
        p.name,
        p.paternalLastName,
        p.maternalLastName,
        p.email,
        p.rut,
        p.phone,
        p.gender,
        p.birthDate,
        COUNT(a.id) as total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_appointments,
        MAX(a.date) as last_appointment_date,
        MIN(a.created_at) as first_appointment_date
      FROM patients p
      LEFT JOIN appointments a ON p.id = a.patient_id
    `;
    
    const params = [];
    
    // ✅ Usar fechas de citas en lugar de created_at de pacientes
    if (startDate && endDate) {
      query += ' WHERE a.created_at BETWEEN ? AND ?';
      params.push(startDate + ' 00:00:00', endDate + ' 23:59:59');
    }
    
    query += ' GROUP BY p.id ORDER BY first_appointment_date DESC';
    
    const [patients] = await db.query(query, params);
    
    // Estadísticas por género
    const genderStatsQuery = `
      SELECT 
        gender,
        COUNT(*) as count,
        ROUND(AVG(DATEDIFF(CURDATE(), birthDate)/365.25), 1) as avg_age
      FROM patients 
      WHERE id IN (
        SELECT DISTINCT patient_id 
        FROM appointments 
        ${startDate && endDate ? 'WHERE created_at BETWEEN ? AND ?' : ''}
      )
      GROUP BY gender
    `;
    
    const genderParams = startDate && endDate ? [startDate + ' 00:00:00', endDate + ' 23:59:59'] : [];
    const [genderStats] = await db.query(genderStatsQuery, genderParams);
    
    const reportData = {
      reportInfo: {
        type: 'patients',
        generatedAt: new Date().toISOString(),
        dateRange: startDate && endDate ? { startDate, endDate } : null,
        totalRecords: patients.length
      },
      patients,
      statistics: {
        genderDistribution: genderStats
      }
    };
    
    res.json(reportData);
    
  } catch (error) {
    console.error('Error generando reporte de pacientes:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GUARDAR REPORTE CON MANEJO DE ERRORES MEJORADO
exports.saveReport = async (req, res) => {
  try {
    const { reportType, reportData, fileName } = req.body;
    
    // Crear directorio de reportes si no existe
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Generar nombre único del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFileName = `${reportType}_${timestamp}_${fileName || 'report'}.json`;
    const filePath = path.join(reportsDir, fullFileName);
    
    // Guardar el reporte
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));
    
    // ✅ INTENTAR guardar en BD, pero continuar si falla
    let reportId = null;
    try {
      const [result] = await db.query(`
        INSERT INTO report_history (
          report_type, 
          file_name, 
          file_path, 
          generated_by, 
          report_summary,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        reportType,
        fullFileName,
        filePath,
        req.body.generatedBy || 'admin',
        JSON.stringify({
          totalRecords: reportData.reportInfo?.totalRecords || 0,
          dateRange: reportData.reportInfo?.dateRange || null,
          filters: reportData.reportInfo?.filters || {}
        })
      ]);
      reportId = result.insertId;
    } catch (dbError) {
      console.warn('⚠️ No se pudo guardar en la base de datos, pero el archivo se creó:', dbError.message);
    }
    
    res.json({
      success: true,
      message: 'Reporte guardado exitosamente',
      fileName: fullFileName,
      filePath,
      reportId: reportId || Date.now()
    });
    
  } catch (error) {
    console.error('Error guardando reporte:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ OBTENER HISTORIAL CON MANEJO DE ERRORES
exports.getReportHistory = async (req, res) => {
  try {
    let reports = [];
    
    try {
      const [result] = await db.query(`
        SELECT 
          id,
          report_type,
          file_name,
          generated_by,
          report_summary,
          created_at
        FROM report_history 
        ORDER BY created_at DESC 
        LIMIT 50
      `);
      reports = result;
    } catch (dbError) {
      console.warn('⚠️ Tabla report_history no existe:', dbError.message);
      
      // ✅ Leer archivos del directorio como respaldo
      const reportsDir = path.join(__dirname, '../../reports');
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir);
        reports = files.map((file, index) => ({
          id: index + 1,
          report_type: file.split('_')[0],
          file_name: file,
          generated_by: 'admin',
          report_summary: JSON.stringify({ totalRecords: 0 }),
          created_at: new Date().toISOString()
        }));
      }
    }
    
    res.json(reports);
    
  } catch (error) {
    console.error('Error obteniendo historial de reportes:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ ESTADÍSTICAS GENERALES CORREGIDAS
exports.getGeneralStatistics = async (req, res) => {
  try {
    // Estadísticas de citas por estado
    const [appointmentStats] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM appointments 
      GROUP BY status
    `);
    
    // Estadísticas por especialidad
    const [specialtyStats] = await db.query(`
      SELECT 
        ph.specialty,
        COUNT(a.id) as appointment_count,
        COUNT(DISTINCT a.patient_id) as unique_patients
      FROM physicians ph
      LEFT JOIN appointments a ON ph.id = a.physician_id
      GROUP BY ph.specialty
      ORDER BY appointment_count DESC
    `);
    
    // Citas por mes (últimos 12 meses)
    const [monthlyStats] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `);
    
    res.json({
      appointmentStatusDistribution: appointmentStats,
      specialtyDistribution: specialtyStats,
      monthlyTrends: monthlyStats
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({ message: error.message });
  }
};