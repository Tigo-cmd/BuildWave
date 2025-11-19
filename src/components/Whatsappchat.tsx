// Lightweight local WhatsApp SVG icon to avoid depending on react-icons
const WhatsappIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20.52 3.48A11.88 11.88 0 0012 .5C6.21.5 1.5 5.21 1.5 11c0 1.95.51 3.84 1.48 5.5L.5 23.5l6.23-2.07A11.44 11.44 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5 0-3.02-1.18-5.86-3.98-8.52zM12 20.5c-1.02 0-2.02-.18-2.96-.52l-.21-.08-3.7 1.23.99-3.6-.12-.23A8.98 8.98 0 013 11c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z" />
    <path d="M17.01 13.21c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.69.88-.85 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.02-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.18 1.96 3 4.76 4.2 3.34 1.4 3.34 0 3.94-.03.6-.03 1.94-.78 2.21-1.53.27-.74.27-1.36.19-1.48-.07-.12-.25-.18-.52-.32z" />
  </svg>
);

export default function WhatsappChat() {
 const whatsappNumber = "2347016162040";
  const whatsappMessage = "Hi BuildWave, I need help with a project.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-1/2 transform translate-y-1/2 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all"
      aria-label="Chat With Us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      {/* Tooltip - appears on hover */}
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 scale-95 transform transition-all duration-150 bg-gray-900 text-white text-sm px-3 py-1 rounded shadow-lg whitespace-nowrap group-hover:opacity-100 group-hover:scale-100"
        aria-hidden="true"
      >
        Chat with us on WhatsApp
      </span>

      <WhatsappIcon size={28} />
    </a>
  );
}