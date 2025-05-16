// backend/controllers/credentialsController.js
const pool = require('../db/db');
const { encrypt, decrypt } = require('../utils/crypto');

// GET /api/credentials
exports.getCredentials = async (req, res) => {
  const userId = req.userId;
  try {
    const { rows } = await pool.query(
      'SELECT id, website, username, password_encrypted FROM credentials WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const creds = rows.map(row => ({
      id: row.id,
      website: decrypt(row.website),
      username: decrypt(row.username),
      password: decrypt(row.password_encrypted),
    }));
    res.json(creds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
};

// POST /api/credentials
exports.createCredential = async (req, res) => {
  const userId = req.userId;
  const { website, username, password } = req.body;
  try {
    const encryptedw = encrypt(website);
    const encryptedu = encrypt(username);
    const encryptedp = encrypt(password);
    const result = await pool.query(
      'INSERT INTO credentials (user_id, website, username, password_encrypted) VALUES($1, $2, $3, $4) RETURNING id',
      [userId, encryptedw, encryptedu, encryptedp]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create credential' });
  }
};

// PUT /api/credentials/:id
exports.updateCredential = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { website, username, password } = req.body;
  try {
    const encryptedw = encrypt(website);
    const encryptedu = encrypt(username);
    const encryptedp = encrypt(password);
    await pool.query(
      'UPDATE credentials SET website=$1, username=$2, password_encrypted=$3 WHERE id=$4 AND user_id=$5',
      [encryptedw, encryptedu, encryptedp, id, userId]
    );
    res.json({ message: 'Credential updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update credential' });
  }
};

// DELETE /api/credentials/:id
exports.deleteCredential = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM credentials WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    res.json({ message: 'Credential deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete credential' });
  }
};