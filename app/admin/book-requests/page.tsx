'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface BookRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'CANCELLED';
  shippedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookRequestsResponse {
  bookRequests: BookRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminBookRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    if (!user.isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchBookRequests();
  }, [user, router, statusFilter, currentPage]);

  const fetchBookRequests = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        status: statusFilter,
      });

      const response = await fetch(`/api/book-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch book requests');
      }

      const data: BookRequestsResponse = await response.json();
      setBookRequests(data.bookRequests);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching book requests:', error);
      setError('Failed to load book requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      const response = await fetch(`/api/book-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchBookRequests();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update request status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'PROCESSING': return '#17a2b8';
      case 'SHIPPED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading book requests...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Book Request Management</h1>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{pagination.total}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div className={styles.nameColumn}>
                    <strong>{request.firstName} {request.lastName}</strong>
                    {request.notes && (
                      <div className={styles.notes}>{request.notes}</div>
                    )}
                  </div>
                </td>
                <td>{request.email}</td>
                <td>
                  <div className={styles.addressColumn}>
                    <div>{request.address}</div>
                    <div>{request.city}, {request.state} {request.zipCode}</div>
                    <div>{request.country}</div>
                  </div>
                </td>
                <td>{request.phone || '-'}</td>
                <td>
                  <span 
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </td>
                <td>{formatDate(request.createdAt)}</td>
                <td>
                  <div className={styles.actions}>
                    <select
                      value={request.status}
                      onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookRequests.length === 0 && (
          <div className={styles.emptyState}>
            No book requests found for the selected status.
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}