export default function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[140px]" />
      <div className="absolute -bottom-32 right-1/4 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
