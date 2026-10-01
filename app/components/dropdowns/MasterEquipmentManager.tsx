// "use client";

// import { useState } from "react";

// interface Equipment {
//   id: string;
//   name: string;
//   makerModel: string;
//   serialNumber: string;
//   specs: string;
//   attachment: string; // URL
// }

// export default function MasterEquipmentManager() {
//   const [equipmentList, setEquipmentList] = useState<Equipment[]>([
//     {
//       id: "1",
//       name: "Main Engine",
//       makerModel: "Wärtsilä W32",
//       serialNumber: "SN-2024-001",
//       specs: "3200 kW, 750 RPM, Max Pressure 180 bar",
//       attachment: "https://example.com/manuals/main_engine.pdf",
//     },
//     {
//       id: "2",
//       name: "Auxiliary Generator",
//       makerModel: "Caterpillar C18",
//       serialNumber: "SN-2024-002",
//       specs: "500 kW, 1500 RPM, 400V",
//       attachment: "https://example.com/manuals/gen.pdf",
//     },
//   ]);

//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<Omit<Equipment, "id">>({
//     name: "",
//     makerModel: "",
//     serialNumber: "",
//     specs: "",
//     attachment: "",
//   });

//   // Reset form
//   const resetForm = () => {
//     setFormData({ name: "", makerModel: "", serialNumber: "", specs: "", attachment: "" });
//     setEditingId(null);
//   };

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Submit form (Add or Update)
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const { name, makerModel, serialNumber, specs, attachment } = formData;
//     if (!name.trim() || !makerModel.trim() || !serialNumber.trim()) {
//       alert("Please fill in all required fields (Name, Maker/Model, Serial Number).");
//       return;
//     }

//     if (editingId) {
//       // Update existing
//       setEquipmentList((prev) =>
//         prev.map((eq) =>
//           eq.id === editingId ? { ...eq, ...formData } : eq
//         )
//       );
//     } else {
//       // Add new
//       const newEquipment: Equipment = {
//         id: Date.now().toString(),
//         ...formData,
//       };
//       setEquipmentList((prev) => [...prev, newEquipment]);
//     }
//     resetForm();
//   };

//   // Start editing
//   const handleEdit = (equipment: Equipment) => {
//     setEditingId(equipment.id);
//     setFormData({
//       name: equipment.name,
//       makerModel: equipment.makerModel,
//       serialNumber: equipment.serialNumber,
//       specs: equipment.specs,
//       attachment: equipment.attachment,
//     });
//   };

//   // Delete with confirmation
//   const handleDelete = (id: string) => {
//     if (window.confirm("Are you sure you want to delete this equipment entry?")) {
//       setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
//       if (editingId === id) resetForm();
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-[#E9ECEF] overflow-hidden mb-8">
//       {/* Header */}
//       <div className="px-6 py-5 border-b border-[#E9ECEF]">
//         <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B1120]">
//           Master Equipment Database
//         </h3>
//         <p className="text-xs text-[#64748B] mt-0.5">
//           Manage ship machinery details (once per equipment)
//         </p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="p-6 border-b border-[#E9ECEF]">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase tracking-widest mb-1">
//               Equipment Name *
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="e.g. Main Engine"
//               className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#0B1120]/20 focus:border-[#0B1120] transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase tracking-widest mb-1">
//               Maker & Model *
//             </label>
//             <input
//               type="text"
//               name="makerModel"
//               value={formData.makerModel}
//               onChange={handleChange}
//               placeholder="e.g. Wärtsilä W32"
//               className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#0B1120]/20 focus:border-[#0B1120] transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase tracking-widest mb-1">
//               Serial Number *
//             </label>
//             <input
//               type="text"
//               name="serialNumber"
//               value={formData.serialNumber}
//               onChange={handleChange}
//               placeholder="e.g. SN-2024-001"
//               className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#0B1120]/20 focus:border-[#0B1120] transition"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase tracking-widest mb-1">
//               Technical Specifications
//             </label>
//             <input
//               type="text"
//               name="specs"
//               value={formData.specs}
//               onChange={handleChange}
//               placeholder="e.g. 3200 kW, 750 RPM"
//               className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#0B1120]/20 focus:border-[#0B1120] transition"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-xs font-mono font-semibold text-[#64748B] uppercase tracking-widest mb-1">
//               Attachment Link (Manuals/Specs)
//             </label>
//             <input
//               type="url"
//               name="attachment"
//               value={formData.attachment}
//               onChange={handleChange}
//               placeholder="https://example.com/manuals/equipment.pdf"
//               className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#0B1120] focus:ring-2 focus:ring-[#0B1120]/20 focus:border-[#0B1120] transition"
//             />
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 mt-4">
//           {editingId && (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0B1120] transition"
//             >
//               Cancel
//             </button>
//           )}
//           <button
//             type="submit"
//             className="px-6 py-2.5 bg-[#0B1120] hover:bg-[#1E293B] text-white text-sm font-bold rounded-xl transition shadow-sm"
//           >
//             {editingId ? "Update Equipment" : "Add Equipment"}
//           </button>
//         </div>
//       </form>

//       {/* Equipment List */}
//       <div className="p-6">
//         {equipmentList.length === 0 ? (
//           <div className="text-center py-8 text-[#94A3B8] font-mono text-sm">
//             No equipment entries yet. Add one above.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-[#F8FAFC] border-b border-[#E9ECEF] text-[11px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
//                   <th className="py-3 px-4 text-left">Name</th>
//                   <th className="py-3 px-4 text-left">Maker & Model</th>
//                   <th className="py-3 px-4 text-left">Serial No.</th>
//                   <th className="py-3 px-4 text-left">Specs</th>
//                   <th className="py-3 px-4 text-left">Attachment</th>
//                   <th className="py-3 px-4 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[#E9ECEF]">
//                 {equipmentList.map((eq) => (
//                   <tr key={eq.id} className="hover:bg-[#F8FAFC] transition-colors">
//                     <td className="py-3 px-4 font-medium text-[#0B1120]">{eq.name}</td>
//                     <td className="py-3 px-4 text-[#1E293B]">{eq.makerModel}</td>
//                     <td className="py-3 px-4 font-mono text-xs text-[#1E293B]">{eq.serialNumber}</td>
//                     <td className="py-3 px-4 text-xs text-[#1E293B]">{eq.specs || "—"}</td>
//                     <td className="py-3 px-4">
//                       {eq.attachment ? (
//                         <a
//                           href={eq.attachment}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 hover:underline text-xs"
//                         >
//                           Link
//                         </a>
//                       ) : (
//                         <span className="text-[#94A3B8]">—</span>
//                       )}
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => handleEdit(eq)}
//                           className="p-1.5 text-[#64748B] hover:text-blue-600 transition"
//                           title="Edit"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => handleDelete(eq.id)}
//                           className="p-1.5 text-[#64748B] hover:text-red-600 transition"
//                           title="Delete"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }