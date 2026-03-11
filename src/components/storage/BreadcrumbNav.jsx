import { HiChevronRight, HiHome } from 'react-icons/hi';

export default function BreadcrumbNav({ path = [], onNavigate }) {
    return (
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
            <button
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
            >
                <HiHome className="text-sm" />
                <span>Home</span>
            </button>

            {path.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                    <HiChevronRight className="opacity-30" />
                    <button
                        onClick={() => onNavigate(folder)}
                        className={`hover:text-primary transition-colors ${index === path.length - 1 ? 'text-primary' : ''
                            }`}
                    >
                        {folder.original_name}
                    </button>
                </div>
            ))}
        </nav>
    );
}
