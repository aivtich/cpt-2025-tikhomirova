// Добавляем в самое начало script.js
let isModule = false;

// Проверяем, является ли скрипт модулем
try {
  // Пробуем использовать import внутри модуля
  if (typeof import.meta !== 'undefined') {
    isModule = true;
    console.log('✅ Скрипт загружен как модуль');
  }
} catch (e) {
  console.log('ℹ️ Скрипт загружен как обычный файл');
}

// Если это модуль - импортируем Supabase
if (isModule) {
  import('./lib/supabase.js')
    .then(({ supabase }) => {
      console.log('✅ Supabase загружен');
      setupRealtimeSync(supabase);
    })
    .catch(error => {
      console.error('❌ Ошибка загрузки Supabase:', error);
    });
}

// Все остальные функции вашего кода остаются без изменений
// Только добавляем параметр supabase в функции:

function setupRealtimeSync(supabase) {
  if (!supabase) {
    console.log('Supabase не доступен');
    return;
  }
  
  supabase
    .channel('students-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'students' 
      }, 
      (payload) => {
        console.log('🔄 Получены обновления с сервера');
        loadFromServer().then(success => {
          if (success) {
            if (window.updateStudentsTable) updateStudentsTable();
            if (window.updateGroupsStats) updateGroupsStats();
            if (window.updateReportFilters) updateReportFilters();
          }
        });
      }
    )
    .subscribe();
}

// Остальной ваш код остается без изменений...
import { supabase } from './lib/supabase.js'

// Добавьте эти функции для синхронизации:

// Функции для работы с Supabase
async function syncWithServer() {
    try {
        // Сохраняем данные на сервере
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(students)
        });
        
        const result = await response.json();
        if (result.success) {
            console.log('✅ Данные синхронизированы с сервером');
            // Сохраняем локальную копию
            localStorage.setItem('students_backup', JSON.stringify(students));
            return true;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        // Сохраняем только локально
        localStorage.setItem('students_backup', JSON.stringify(students));
        return false;
    }
}

async function loadFromServer() {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) throw new Error('Network error');
        
        const serverStudents = await response.json();
        if (serverStudents && serverStudents.length > 0) {
            students = serverStudents;
            saveToLocalStorage();
            console.log('✅ Данные загружены с сервера');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Ошибка загрузки с сервера:', error);
        return false;
    }
}

// Real-time синхронизация
function setupRealtimeSync() {
    // Подписка на изменения в Supabase
    supabase
        .channel('students-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'students' 
            }, 
            (payload) => {
                console.log('🔄 Получены обновления с сервера');
                loadFromServer().then(success => {
                    if (success) {
                        // Обновляем интерфейс
                        if (window.updateStudentsTable) updateStudentsTable();
                        if (window.updateGroupsStats) updateGroupsStats();
                        if (window.updateReportFilters) updateReportFilters();
                    }
                });
            }
        )
        .subscribe();
}

// Обновите функцию saveToLocalStorage
function saveToLocalStorage() {
    localStorage.setItem('spt_students', JSON.stringify(students));
    // Пытаемся синхронизировать с сервером
    syncWithServer().then(success => {
        if (!success) {
            console.log('Данные сохранены локально (сервер недоступен)');
        }
    });
}

// Обновите функцию loadFromLocalStorage
function loadFromLocalStorage() {
    const savedStudents = localStorage.getItem('spt_students');
    
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
    
    // Пытаемся загрузить с сервера при запуске
    loadFromServer().then(success => {
        if (success) {
            console.log('Данные синхронизированы с сервером');
        }
    });
    
    // Включаем real-time синхронизацию
    setupRealtimeSync();
}

// Добавьте кнопку синхронизации в интерфейс психолога
function addSyncButton() {
    const controlsDiv = document.querySelector('.psychologist-dashboard .controls');
    if (controlsDiv && !document.getElementById('syncButton')) {
        const syncButton = document.createElement('button');
        syncButton.id = 'syncButton';
        syncButton.textContent = '🔄 Синхронизировать';
        syncButton.addEventListener('click', () => {
            syncWithServer().then(success => {
                if (success) {
                    alert('Данные синхронизированы!');
                } else {
                    alert('Ошибка синхронизации. Проверьте подключение к интернету.');
                }
            });
        });
        controlsDiv.appendChild(syncButton);
    }
}

// Вызовите эту функцию после загрузки интерфейса психолога
// Добавьте в функцию loadPsychologistData():
function loadPsychologistData() {
    updateStudentsTable();
    updateGroupsStats();
    updateReportFilters();
    addSyncButton(); // ← ДОБАВЬТЕ ЭТУ СТРОКУ
}