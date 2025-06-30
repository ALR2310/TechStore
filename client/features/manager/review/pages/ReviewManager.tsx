import Filter from '~/components/Filter';

export default function ReviewManager() {
  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý đánh giá</h1>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        grid={3}
        filters={[
          {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Nhập từ khoá tìm kiếm',
            className: 'col-span-2',
          },
          {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { label: 'Đã duyệt', value: 'Approved' },
              { label: 'Chưa duyệt', value: 'Pending' },
              { label: 'Bị từ chối', value: 'Rejected' },
            ],
          },
          {
            key: 'rating',
            label: 'Đánh giá',
            type: 'select',
            options: [
              { label: '1 sao', value: '1' },
              { label: '2 sao', value: '2' },
              { label: '3 sao', value: '3' },
              { label: '4 sao', value: '4' },
              { label: '5 sao', value: '5' },
            ],
          },
          {
            key: 'product',
            label: 'Sản phẩm',
            type: 'text',
            placeholder: 'Nhập tên sản phẩm',
          },
          {
            key: 'user',
            label: 'Người dùng',
            type: 'text',
            placeholder: 'Nhập tên người dùng',
          },
        ]}
      />
    </div>
  );
}
