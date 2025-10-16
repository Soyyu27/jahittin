const db = require('../config/database');

// Save Custom Design
exports.saveDesign = async (req, res) => {
  try {
    const { product_type, design_data, preview_image } = req.body;
    const user_id = req.user.id;

    // Validasi input
    if (!product_type || !design_data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data desain tidak lengkap.' 
      });
    }

    // Convert design_data ke JSON string jika belum
    const designDataJson = typeof design_data === 'string' 
      ? design_data 
      : JSON.stringify(design_data);

    const [result] = await db.execute(
      'INSERT INTO designs (user_id, product_type, design_data, preview_image) VALUES (?, ?, ?, ?)',
      [user_id, product_type, designDataJson, preview_image || null]
    );

    res.status(201).json({
      success: true,
      message: 'Desain berhasil disimpan!',
      designId: result.insertId
    });

  } catch (error) {
    console.error('Save design error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menyimpan desain.' 
    });
  }
};

// Get User Designs
exports.getUserDesigns = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [designs] = await db.execute(
      'SELECT * FROM designs WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    // Parse JSON design_data
    const parsedDesigns = designs.map(design => ({
      ...design,
      design_data: JSON.parse(design.design_data)
    }));

    res.json({
      success: true,
      designs: parsedDesigns
    });

  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil desain.' 
    });
  }
};

// Get Design by ID
exports.getDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [designs] = await db.execute(
      'SELECT * FROM designs WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (designs.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Desain tidak ditemukan.' 
      });
    }

    const design = {
      ...designs[0],
      design_data: JSON.parse(designs[0].design_data)
    };

    res.json({
      success: true,
      design
    });

  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil desain.' 
    });
  }
};

// Delete Design
exports.deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM designs WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Desain tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      message: 'Desain berhasil dihapus.'
    });

  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menghapus desain.' 
    });
  }
};