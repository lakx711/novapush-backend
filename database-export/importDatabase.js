import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { User } from '../models/User.js'
import { Template } from '../models/Template.js'
import { NotificationLog } from '../models/NotificationLog.js'
import { Preference } from '../models/Preference.js'

dotenv.config()

async function importDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB })
    console.log('✓ Connected to MongoDB\n')

    const IMPORT_DIR = path.join(process.cwd(), 'database-export')

    console.log('📥 Importing collections...\n')

    // Import Templates
    const templates = JSON.parse(fs.readFileSync(path.join(IMPORT_DIR, 'templates.json'), 'utf8'))
    if (templates.length > 0) {
      await Template.deleteMany({})
      await Template.insertMany(templates)
      console.log(`✓ Imported ${templates.length} templates`)
    }

    // Import Users (Note: passwords will need to be reset)
    const users = JSON.parse(fs.readFileSync(path.join(IMPORT_DIR, 'users.json'), 'utf8'))
    if (users.length > 0) {
      console.log('⚠ Note: User passwords are not included in export for security')
      console.log('  Users will need to reset their passwords')
    }

    // Import Notification Logs
    const logs = JSON.parse(fs.readFileSync(path.join(IMPORT_DIR, 'notification-logs.json'), 'utf8'))
    if (logs.length > 0) {
      await NotificationLog.deleteMany({})
      await NotificationLog.insertMany(logs)
      console.log(`✓ Imported ${logs.length} notification logs`)
    }

    // Import Preferences
    const preferences = JSON.parse(fs.readFileSync(path.join(IMPORT_DIR, 'preferences.json'), 'utf8'))
    if (preferences.length > 0) {
      await Preference.deleteMany({})
      await Preference.insertMany(preferences)
      console.log(`✓ Imported ${preferences.length} preferences`)
    }

    console.log('\n✅ Database import completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error importing database:', error)
    process.exit(1)
  }
}

importDatabase()
