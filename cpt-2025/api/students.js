import { supabase } from '../lib/supabase.js'

export default async function handler(request, response) {
  // Разрешаем запросы с любого домена
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Обработка preflight запросов
  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  try {
    // GET - получение всех студентов
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return response.status(500).json({ error: error.message })
      }

      return response.status(200).json(data || [])
    }

    // POST - сохранение студентов
    if (request.method === 'POST') {
      const students = request.body

      if (!Array.isArray(students)) {
        return response.status(400).json({ error: 'Expected array of students' })
      }

      // Удаляем старые данные
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .neq('id', 0)

      if (deleteError) {
        console.error('Delete error:', deleteError)
      }

      // Сохраняем новые данные
      const { data, error } = await supabase
        .from('students')
        .insert(students)
        .select()

      if (error) {
        console.error('Insert error:', error)
        return response.status(500).json({ error: error.message })
      }

      return response.status(200).json({ 
        success: true, 
        count: data.length,
        message: `Сохранено ${data.length} студентов` 
      })
    }

    return response.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Server error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}