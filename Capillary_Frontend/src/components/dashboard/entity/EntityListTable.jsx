
import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Download, Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteEntity, getAllEntityData } from "../../../api/service/adminServices";


const EntityListTable = () => {
  const navigate = useNavigate();
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [entity, setEntity] = useState([]);

  useEffect(() => {
    const fettchAllEntity = async () => {
      const response = await getAllEntityData();
      console.log(response);
      if (response.status === 200) {
        setEntity(response.data);
      }
    };
    fettchAllEntity();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEntities(selectedEntities.map((entity) => entity.sno));
    } else {
      setSelectedEntities([]);
    }
  };

  const handleSelectentities = (sno) => {
    setSelectedEntities((prev) =>
      prev.includes(sno) ? prev.filter((id) => id !== sno) : [...prev, sno]
    );
  };

  const onDelete = async (id) => {
    try {
      const response = await deleteEntity(id);
      console.log(response);
      setEntity(entity?.filter((entity) => entity?._id !== id));
    } catch (err) {
      console.log("Error in delete entity", err);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Entity List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              onClick={() => navigate("/entity-list-table/entities")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 w-12 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEntities.length === entity.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Sno
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      EntityName
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Currency
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      AddressLine
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Tax Id
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Invoice Mail Id
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Po MailId
                    </th>

                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entity.map((entities,index) => (
                    <tr key={entities.sno} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEntities.includes(entities.sno)}
                          onChange={() => handleSelectentities(entities.sno)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.entityName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.addressLine}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.taxId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.invoiceMailId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.poMailId}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entities.status}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <button
                            // onClick={() => onEdit(entities)}
                            className="text-primary hover:text-primary/80"
                            onClick={() =>
                              navigate(`/entity-list-table/edit-entities/${entities._id}`)
                            }
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => onDelete(entities._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityListTable;
