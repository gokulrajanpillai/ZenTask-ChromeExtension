import { Task } from '../types';

export class TaskList {
    constructor(private container: HTMLElement) { }

    render(
        tasks: Task[],
        activeTaskId: string | null,
        onAddTask: (title: string) => void,
        onToggleTask: (id: string) => void,
        onStartTask: (id: string) => void,
        onDeleteTask: (id: string) => void
    ) {
        // Sort: Active first, then by order/created
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.id === activeTaskId) return -1;
            if (b.id === activeTaskId) return 1;
            return (a.order || 0) - (b.order || 0);
        });

        this.container.innerHTML = `
      <div class="task-list-panel">
        <div class="tasks-header">
            <span>Today's Cycle</span>
            <span style="font-size: 0.8em; opacity: 0.7">${tasks.filter(t => t.isCompleted).length}/${tasks.length}</span>
        </div>

        <div class="task-list">
          ${sortedTasks.length === 0 ?
                '<div class="empty-state" style="text-align:center; padding: 40px; opacity: 0.5">Focus on one thing at a time.</div>' : ''}
          ${sortedTasks.map(task => this.renderTaskRow(task, activeTaskId)).join('')}
        </div>
        
        <div class="task-input-container">
            <input type="text" id="new-task-input" class="task-input" placeholder="What is your next focus?" />
            <button id="add-task-btn" class="btn-secondary" style="padding: 10px 16px;">+</button>
        </div>
      </div>
    `;

        // Event Listeners
        const input = this.container.querySelector('#new-task-input') as HTMLInputElement;
        const addBtn = this.container.querySelector('#add-task-btn');

        const handleAdd = () => {
            if (input.value.trim()) {
                onAddTask(input.value.trim());
                input.value = '';
            }
        };

        addBtn?.addEventListener('click', handleAdd);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdd();
        });

        // Delegation
        this.container.querySelectorAll('.task-item').forEach(el => {
            const id = (el as HTMLElement).dataset.id!;

            // Click on checkbox
            el.querySelector('.task-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onToggleTask(id);
            });

            // Click on delete
            el.querySelector('.delete-task-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                onDeleteTask(id);
            });

            // Click on row to set active (if not completed)
            el.addEventListener('click', () => {
                if (!el.classList.contains('completed') && id !== activeTaskId) {
                    onStartTask(id);
                }
            });
        });
    }

    private renderTaskRow(task: Task, activeTaskId: string | null): string {
        const isActive = task.id === activeTaskId;
        const isDone = task.isCompleted;

        // Format time
        const totalMinutes = Math.floor((task.totalTimeMs || 0) / 60000);
        const timeDisplay = totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '';

        return `
        <div class="task-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox">
                ${isDone ? '✓' : ''}
            </div>
            <div class="task-content">
                <span class="task-title">${task.title}</span>
                <div class="task-meta">
                    ${isActive ? '<span style="color:var(--color-primary)">● Focusing</span>' : ''}
                    ${task.pomodorosCompleted > 0 ? `<span>${task.pomodorosCompleted} 🍅</span>` : ''}
                    ${timeDisplay ? `<span>${timeDisplay}</span>` : ''}
                </div>
            </div>
            <button class="delete-task-btn" style="background:none; border:none; color:inherit; opacity:0.5; cursor:pointer; padding:4px;">×</button>
        </div>
      `;
    }
}
