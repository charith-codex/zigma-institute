"use client";

import React from "react";

export default function CalendarEmbed() {
  return (
    <section className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">
        Zigma Institute Academic Calendar
      </h2>

      <div className="w-full max-w-5xl aspect-video rounded-lg overflow-hidden border-2 border-blue-100 shadow-lg">
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&title=Zigma%20Institute&showCalendars=0&src=Y29yZW5tdW5yb0BnbWFpbC5jb20&src=ZW4ubGsjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%230b8043"
          style={{ border: 0 }}
          className="w-full h-full"
          loading="lazy"
        ></iframe>
      </div>

      <p className="mt-6 text-sm text-gray-600 text-center max-w-md">
        Stay updated with upcoming classes, exams, and institute events. This
        calendar is automatically synced in real time.
      </p>
    </section>
  );
}
