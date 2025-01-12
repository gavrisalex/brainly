package com.example.QA.repository;

import com.example.QA.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Integer> {
    @Query("SELECT v FROM Vote v WHERE v.response.response_id = :responseId")
    List<Vote> findAllByResponseResponse_id(@Param("responseId") int responseId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.response.response_id = :responseId")
    long countVotesByResponseId(@Param("responseId") int responseId);

    @Query("SELECT v FROM Vote v WHERE v.response.response_id = :responseId AND v.user.id = :userId")
    Optional<Vote> findByResponseIdAndUserId(@Param("responseId") int responseId, @Param("userId") int userId);
}
