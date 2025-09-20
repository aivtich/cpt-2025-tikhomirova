import { createClient } from '@supabase/supabase-js'

// ЗАМЕНИТЕ эти значения на свои из Supabase!
const supabaseUrl = 'https://ваш-проект.supabase.co'
const supabaseKey = 'ваш-anon-key'

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Проверка подключения
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Ошибка подключения к Supabase:', error)
  } else {
    console.log('Успешное подключение к Supabase')
  }
})