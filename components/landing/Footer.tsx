import { Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='py-12 border-t border-white/10 bg-black/50 backdrop-blur-sm'>
      <div className='container mx-auto px-6 max-w-6xl'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='flex items-center space-x-2'>
            <div className='bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-2 rounded-xl shadow-lg shadow-purple-500/25 ring-2 ring-white/10'>
              <Cpu className='w-5 h-5 text-white' />
            </div>
            <span className='text-lg font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent'>Otto</span>
          </div>

          <div className='flex items-center gap-6 text-sm text-gray-400'>
            <a href='/privacy' className='hover:text-white transition-colors'>
              개인정보처리방침
            </a>
            <a href='/terms' className='hover:text-white transition-colors'>
              이용약관
            </a>
          </div>

          <div className='text-sm text-gray-400'>© 2025 Otto. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
