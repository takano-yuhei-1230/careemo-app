import AdminSidebar from "@/components/AdminSidebar";

export default function UsersPage() {
  return (
    <div className='sites'>
      <div className='flex flex-row'>
        <AdminSidebar />
        <div className='p-4 md:p-6 flex-auto'>
          <div className="flex justify-center items-center h-full">
            <p className="text-lg py-2 px-4 bg-neutral-100 rounded-lg">それはあなたです！</p>
          </div>
        </div>
      </div>
    </div>
  );
}
